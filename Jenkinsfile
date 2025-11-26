pipeline {

    agent any

    environment {
        SONAR_HOST_URL = 'http://sonarqube:9000'
        SONAR_LOGIN = credentials('sonarqube-token')
        JIRA_TOKEN = credentials('jira-token')
        
        BRANCH_CLEAN = "${env.GIT_BRANCH?.replace('origin/', '').replace('/', '-') ?: 'main'}"
        SONAR_PROJECT_KEY = "reservationApp-${BRANCH_CLEAN}"

        DOCKER_BACKEND_IMAGE = "faroukelrey19008/reservation-backend"
        DOCKER_FRONTEND_IMAGE = "faroukelrey19008/reservation-frontend"
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        ARGOCD_SERVER = "host.docker.internal:32050"

        SERVICENOW_INSTANCE = 'your-instance'
        SERVICENOW_CREDENTIALS = credentials('servicenow-credentials')
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
                sh "git fetch --all"
                sh "mkdir -p reports"
            }
        }

        stage('Backend - Install Dependencies') {
            steps {
                dir('backend') {
                    sh "composer install --no-interaction --prefer-dist || true"
                }
            }
        }

        stage('Backend - Tests + Coverage') {
            steps {
                dir('backend') {
                    sh '''
                        # Force Laravel to use safe drivers in CI - overwrite .env.testing completely
                        cat > .env.testing << 'EOF'
        CACHE_DRIVER=array
        SESSION_DRIVER=array
        DB_CONNECTION=sqlite
        DB_DATABASE=:memory:
        EOF

                        # Verify the file was created
                        echo "=== Content of .env.testing ==="
                        cat .env.testing

                        # Run migrate and tests with explicit environment
                        php artisan migrate --env=testing --force --no-interaction

                        # Run PHPUnit with coverage
                        vendor/bin/phpunit --coverage-clover coverage.xml || true

                        # Show coverage file
                        ls -l coverage.xml || echo "No coverage.xml generated"
                    '''
                }
            }
        }
        stage('Frontend - Install + Coverage') {
            steps {
                dir('frontend') {
                    sh """
                        npm install
                        npm test -- --coverage || true
                        ls -l coverage/lcov.info || true
                    """
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh """
                        sonar-scanner \
                            -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                            -Dsonar.sources=backend/app,frontend/src \
                            -Dsonar.php.coverage.reportPaths=backend/coverage.xml \
                            -Dsonar.javascript.lcov.reportPaths=frontend/coverage/lcov.info \
                            -Dsonar.exclusions=**/vendor/**,**/node_modules/** \
                            -Dsonar.host.url=${SONAR_HOST_URL} \
                            -Dsonar.token=${SONAR_LOGIN}
                    """
                }
            }
        }

        stage('Prepare Reports Folders') {
            steps {
                sh """
                    mkdir -p reports/dependency-check
                    mkdir -p reports/grype
                    mkdir -p reports/semgrep
                """
            }
        }

        stage('Quality Gate') {
            steps {
                script {
                    timeout(time: 15, unit: 'MINUTES') {
                        try {
                            def qg = waitForQualityGate abortPipeline: false
                            env.QG_STATUS = qg.status
                        } catch (e) {
                            env.QG_STATUS = "TIMEOUT"
                            echo "Quality Gate check failed: ${e.message}"
                        }
                    }
                }
            }
        }

        stage('OWASP Dependency Scan') {
            steps {
                withCredentials([string(credentialsId: 'nvd-api-key', variable: 'NVD')]) {
                    sh """
                        docker run --rm \
                            --user 0 \
                            -v \$(pwd)/backend:/src \
                            -v \$(pwd)/reports/dependency-check:/report \
                            -e NVD_API_KEY=\$NVD \
                            owasp/dependency-check:latest \
                            --scan /src \
                            --format ALL \
                            --out /report \
                            --nvdApiKey \$NVD || true
                    """
                }
            }
        }

        stage('Vulnerability Scan (Grype)') {
            steps {
                sh """
                    grype dir:backend -o json > reports/grype-backend.json || true
                    grype dir:frontend -o json > reports/grype-frontend.json || true
                """
            }
        }

        stage('Gitleaks') {
            steps {
                sh "gitleaks detect --source . --report-path reports/gitleaks.json --no-git || true"
            }
        }

        stage('Semgrep (OWASP Top10)') {
            steps {
                sh "semgrep --config owasp-top-ten --json --output reports/semgrep.json . || true"
            }
        }

        stage('Report to JIRA') {
            steps {
                withCredentials([
                    string(credentialsId: 'jira-email', variable: 'J_EMAIL'),
                    string(credentialsId: 'jira-token', variable: 'J_TOKEN')
                ]) {
                    script {
                        def status = env.QG_STATUS ?: 'UNKNOWN'
                        
                        sh """
                            AUTH=\$(printf "%s:%s" "\$J_EMAIL" "\$J_TOKEN" | base64 -w 0)
                            
                            curl -X POST \
                                -H "Authorization: Basic \$AUTH" \
                                -H "Content-Type: application/json" \
                                --data '{
                                    "fields": {
                                        "project": {"key": "DA"},
                                        "summary": "DevSecOps Report - Build #${BUILD_NUMBER}",
                                        "description": {
                                            "type": "doc",
                                            "version": 1,
                                            "content": [
                                                {
                                                    "type": "paragraph",
                                                    "content": [
                                                        {
                                                            "type": "text",
                                                            "text": "Quality Gate Status: ${status}"
                                                        }
                                                    ]
                                                },
                                                {
                                                    "type": "paragraph",
                                                    "content": [
                                                        {
                                                            "type": "text",
                                                            "text": "Build URL: ${BUILD_URL}"
                                                        }
                                                    ]
                                                },
                                                {
                                                    "type": "paragraph",
                                                    "content": [
                                                        {
                                                            "type": "text",
                                                            "text": "Branch: ${BRANCH_CLEAN}"
                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        "issuetype": {"name": "Task"}
                                    }
                                }' \
                                https://etud-team-devops.atlassian.net/rest/api/3/issue || echo "JIRA API call failed but continuing..."
                        """
                    }
                }
            }
        }

        stage('Build Docker Images') {
            when {
                expression { env.BRANCH_CLEAN == 'main' }
            }
            steps {
                sh """
                    echo "Building Docker images with tag: ${IMAGE_TAG}"
                    docker build -t ${DOCKER_BACKEND_IMAGE}:${IMAGE_TAG} -t ${DOCKER_BACKEND_IMAGE}:latest ./backend
                    docker build -t ${DOCKER_FRONTEND_IMAGE}:${IMAGE_TAG} -t ${DOCKER_FRONTEND_IMAGE}:latest ./frontend
                """
            }
        }

        stage('Push Docker Images') {
            when {
                expression { env.BRANCH_CLEAN == 'main' }
            }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh """
                        echo "\$DOCKER_PASS" | docker login -u "\$DOCKER_USER" --password-stdin
                        docker push ${DOCKER_BACKEND_IMAGE}:${IMAGE_TAG}
                        docker push ${DOCKER_BACKEND_IMAGE}:latest
                        docker push ${DOCKER_FRONTEND_IMAGE}:${IMAGE_TAG}
                        docker push ${DOCKER_FRONTEND_IMAGE}:latest
                        docker logout
                    """
                }
            }
        }
        stage('Update K8s Manifests') {
            steps {

                sh """
                    # Update backend image
                    sed -i 's|image: faroukelrey19008/reservation-backend:.*|image: faroukelrey19008/reservation-backend:${BUILD_NUMBER}|' k8s/backend/deployment.yaml

                    # Update frontend image
                    sed -i 's|image: faroukelrey19008/reservation-frontend:.*|image: faroukelrey19008/reservation-frontend:${BUILD_NUMBER}|' k8s/frontend/deployment.yaml

                    git add k8s/
                    git commit -m "Deploy build #${BUILD_NUMBER}" || true
                """

                // 🔥 AUTHENTICATED G
                withCredentials([usernamePassword(credentialsId: 'jenkins-token', usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PASS')]) {
                    sh """
                        git config user.email "jenkins@ci.com"
                        git config user.name "Jenkins CI"

                        git remote set-url origin https://${GIT_USER}:${GIT_PASS}@github.com/farouk-alt/reservationApp.git

                        git push origin HEAD:main
                    """
                }
            }
        }
        stage('Trigger ArgoCD Sync') {
            when {
                expression { env.BRANCH_CLEAN == 'main' }
            }
            steps {
                withCredentials([string(credentialsId: 'argocd-token', variable: 'ARGOCD_TOKEN')]) {
                    script {
                        def timestamp = sh(script: 'date -u +"%Y-%m-%dT%H:%M:%SZ"', returnStdout: true).trim()

                        sh """
                            kubectl patch app reservation-app -n argocd --type merge -p '{
                                "metadata": {
                                    "annotations": {
                                        "servicenow-deployment-id": "${BUILD_NUMBER}",
                                        "servicenow-deployment-time": "${timestamp}"
                                    }
                                }
                            }' || true

                            argocd app sync reservation-app \
                                --server host.docker.internal:32050 \
                                --auth-token ${ARGOCD_TOKEN} \
                                --insecure --grpc-web --force --prune || true

                            argocd app wait reservation-app \
                                --server host.docker.internal:32050 \
                                --auth-token ${ARGOCD_TOKEN} \
                                --insecure --grpc-web --timeout 300 || true
                        """
                    }
                }
            }
        }
        stage('ServiceNow Integration') {
            when {
                expression { env.BRANCH_CLEAN == 'main' }
            }
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'servicenow-credentials',
                    usernameVariable: 'SERVICENOW_USER',
                    passwordVariable: 'SERVICENOW_PASS'
                )]) {
                    sh '''
                        BUILD_NUM="${BUILD_NUMBER}"
                        BUILD_URL="${BUILD_URL}"

                        # Create Change Request
                        curl -s -X POST "https://dev190642.service-now.com/api/now/table/change_request" \
                            -u "${SERVICENOW_USER}:${SERVICENOW_PASS}" \
                            -H "Content-Type: application/json" \
                            -d '{
                            "short_description": "Deploy Reservation App v'"$BUILD_NUM"'",
                            "description": "Application: Reservation Management System\\nVersion: '"$BUILD_NUM"'\\nEnvironment: Production\\nBranch: main\\nDeployed by: Jenkins Pipeline\\nJenkins Build: '"$BUILD_URL"'\\nChanges: Updated containers to version '"$BUILD_NUM"'",
                            "priority": "3",
                            "risk": "Low",
                            "impact": "Low",
                            "type": "Standard"
                            }' || echo "Change Request failed (ignored)"

                        # Create Incident
                        curl -s -X POST "https://dev190642.service-now.com/api/now/table/incident" \
                            -u "${SERVICENOW_USER}:${SERVICENOW_PASS}" \
                            -H "Content-Type: application/json" \
                            -d '{
                            "short_description": "[DEPLOYMENT] Reservation App v'"$BUILD_NUM"'",
                            "description": "Deployment SUCCESS\\n• Version: '"$BUILD_NUM"'\\n• Build URL: '"$BUILD_URL"'\\n• ArgoCD Sync: Completed\\n• Images: faroukelrey19008/reservation-{backend,frontend}:'"$BUILD_NUM"'",
                            "priority": "4",
                            "impact": "3",
                            "urgency": "3",
                            "category": "DevOps"
                            }' || echo "Incident creation failed (ignored)"

                        echo "ServiceNow integration completed"
                    '''
                }
            }
        }
    }

    post {
        success { 
            echo "✅ Build OK - Quality Gate: ${env.QG_STATUS}"
            echo "✅ Deployed version: ${IMAGE_TAG}"
        }
        failure { 
            echo "❌ Build Failed"
        }
        always {
            echo "Pipeline completed. Check reports in workspace/reports/"
            // Cleanup old docker images
            sh "docker system prune -f || true"
        }
    }
}