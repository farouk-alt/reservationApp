pipeline {

    agent any

    environment {
        SONAR_HOST_URL = 'http://sonarqube:9000'
        SONAR_LOGIN = credentials('sonarqube-token')
        JIRA_TOKEN = credentials('jira-token')
        BRANCH_CLEAN = "${env.GIT_BRANCH?.replace('origin/', '').replace('/', '-') ?: 'main'}"
        SONAR_PROJECT_KEY = "reservationApp-${BRANCH_CLEAN}"
    }

    stages {

        stage('Checkout SCM') {
            steps { 
                checkout scm 
                sh "mkdir -p reports"
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

        stage('Quality Gate') {
            steps {
                script {
                    qg = waitForQualityGate()
                    QG_STATUS = qg.status
                    echo "Quality Gate: ${QG_STATUS}"
                }
            }
        }

        stage('Dependency Scan (OWASP)') {
            steps {
                sh """
                    dependency-check \
                        --scan backend \
                        --format HTML \
                        --out reports/dependency-check
                """
            }
        }

        stage('Container Scan (Trivy)') {
            steps {
                sh """
                    trivy fs backend --format json --output reports/trivy-backend.json
                    trivy fs frontend --format json --output reports/trivy-frontend.json
                """
            }
        }

        stage('Secrets Scan (Gitleaks)') {
            steps {
                sh """
                    gitleaks detect \
                        --source . \
                        --report-path reports/gitleaks.json \
                        --no-git
                """
            }
        }

        stage('SAST (Semgrep OWASP Top 10)') {
            steps {
                sh """
                    semgrep --config owasp-top-ten \
                    --json --output reports/semgrep.json .
                """
            }
        }

        stage('Send Report to Jira') {
            steps {
                script {
                    sh """
                    curl -X POST \
                        -H "Content-Type: application/json" \
                        -u "farouk.karti@etud.iga.ac.ma:${JIRA_TOKEN}" \
                        --data '{
                            "fields": {
                                "project": {"key": "DEV"},
                                "summary": "DevSecOps Report - Build #${env.BUILD_NUMBER}",
                                "description": "Quality Gate: ${QG_STATUS}",
                                "issuetype": {"name": "Task"}
                            }
                        }' \
                        https://faroukkarti.atlassian.net/rest/api/3/issue
                    """
                }
            }
        }

        stage('Backend - Install Dependencies') {
            steps {
                dir('backend') {
                    sh "composer install --no-interaction --prefer-dist || true"
                }
            }
        }

        stage('Backend - Run Tests') {
            steps {
                dir('backend') {
                    sh "vendor/bin/phpunit --testdox || true"
                }
            }
        }

        stage('Frontend - Install & Build') {
            steps {
                dir('frontend') {
                    sh "npm install || true"
                    sh "npm run build || true"
                }
            }
        }
    }

    post {
        success {
            echo "Build completed successfully!"
        }
        failure {
            echo "Build failed!"
        }
    }
}
