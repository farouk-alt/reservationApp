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
                        echo "Skipping seeding in testing environment"
                        echo "Running PHPUnit with coverage..."
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

       stage('Quality Gate') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: false
                }
            }
        }



        stage('OWASP Dependency Scan') {
            steps {
                sh "dependency-check --scan backend --format HTML --out reports/dependency-check"
            }
        }

        stage('Vulnerability Scan (Grype)') {
            steps {
                sh """
                    grype dir:backend -o json > reports/grype-backend.json
                    grype dir:frontend -o json > reports/grype-frontend.json
                """
            }
        }


        stage('Gitleaks') {
            steps {
                sh "gitleaks detect --source . --report-path reports/gitleaks.json --no-git"
            }
        }

        stage('Semgrep (OWASP Top10)') {
            steps {
                sh "semgrep --config owasp-top-ten --json --output reports/semgrep.json ."
            }
        }

        stage('Report to JIRA') {
            steps {
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

    post {
        success { echo "✅ Build OK" }
        failure { echo "❌ Build Failed" }
    }
}
