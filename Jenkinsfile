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
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
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
                    sh """
                        php artisan migrate --env=testing --force
                        vendor/bin/phpunit --coverage-clover coverage.xml || true
                        ls -l coverage.xml || true
                    """
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

        stage('Trigger ArgoCD Sync') {
            when {
                expression { env.BRANCH_CLEAN == 'main' }
            }
            steps {
                withCredentials([string(credentialsId: 'argocd-token', variable: 'ARGOCD_TOKEN')]) {
                    script {
                        // Wait for GitHub to process the push
                        sleep(time: 10, unit: 'SECONDS')
                        
                        sh """
                            # Install ArgoCD CLI if not present
                            if [ ! -f /usr/local/bin/argocd ]; then
                                echo "Installing ArgoCD CLI..."
                                curl -sSL -o /usr/local/bin/argocd https://github.com/argoproj/argo-cd/releases/download/v2.9.3/argocd-linux-amd64
                                chmod +x /usr/local/bin/argocd
                            fi
                            
                            # Use internal Kubernetes service DNS (both Jenkins and ArgoCD are in same cluster)
                            ARGOCD_SERVER="host.docker.internal:32050"
                            
                            # Sync the application
                            echo "Triggering ArgoCD sync for reservation-app..."
                            argocd app sync reservation-app \
                                --server $ARGOCD_SERVER \
                                --auth-token $ARGOCD_TOKEN \
                                --plaintext \
                                --grpc-web \
                                --force \
                                --prune || echo "ArgoCD sync command failed, but continuing..."
                            
                            # Wait for sync to complete
                            echo "Waiting for ArgoCD sync to complete..."
                            argocd app wait reservation-app \
                                --server \$ARGOCD_SERVER \
                                --auth-token \$ARGOCD_TOKEN \
                                --plaintext \
                                --grpc-web \
                                --timeout 300 || echo "ArgoCD wait timed out, check manually"
                            
                            # Show sync status
                            argocd app get reservation-app \
                                --server \$ARGOCD_SERVER \
                                --auth-token \$ARGOCD_TOKEN \
                                --plaintext \
                                --grpc-web || true
                        """
                    }
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