pipeline {

    agent any

    environment {
        SONAR_HOST_URL = 'http://sonarqube:9000'
        SONAR_LOGIN = credentials('sonarqube-token')

        JIRA_TOKEN = credentials('jira-token')
        // ❌ REMOVE THIS, IT BREAKS THE PIPELINE
        // JIRA_EMAIL = "farouk.karti@etud.iga.ac.ma"

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
                            -e NVD_API_KEY=$NVD \
                            owasp/dependency-check:latest \
                            --scan /src \
                            --format ALL \
                            --out /report \
                            --nvdApiKey $NVD || true
                    """
                }
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
                        def auth = "${J_EMAIL}:${J_TOKEN}".bytes.encodeBase64().toString()

                        sh """
                            curl -X POST \
                                -H "Authorization: Basic ${auth}" \
                                -H "Content-Type: application/json" \
                                --data '{
                                    "fields": {
                                        "project": {"key": "DA"},
                                        "summary": "DevSecOps Report - Build #${env.BUILD_NUMBER}",
                                        "description": "Quality Gate: ${env.QG_STATUS}",
                                        "issuetype": {"name": "Task"}
                                    }
                                }' \
                                https://etud-team-devops.atlassian.net/rest/api/3/issue
                        """
                    }
                }
            }
        }



    }

    post {
        success { echo "✅ Build OK" }
        failure { echo "❌ Build Failed" }
    }
}
