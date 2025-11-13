pipeline {
    agent any

    environment {
        WORKSPACE_PATH = sh(script: 'echo $WORKSPACE', returnStdout: true).trim()
        HOST_WORKSPACE = sh(script: 'docker inspect -f "{{range .Mounts}}{{if eq .Destination \\"/var/jenkins_home\\"}}{{.Source}}{{end}}{{end}}" jenkins', returnStdout: true).trim()
        SONAR_HOST_URL = 'http://sonarqube:9000'
        SONAR_LOGIN = credentials('sonarqube-token') // Create this in Jenkins
    }

    stages {
        stage('Checkout SCM') {
            steps {
                checkout scm
            }
        }

        stage('Backend - Composer install') {
            steps {
                script {
                    echo "Using host path: ${HOST_WORKSPACE}/workspace/${JOB_NAME}"
                    sh """
                        docker run --rm \
                          --network reservationapp_app_network \
                          -v ${HOST_WORKSPACE}/workspace/${JOB_NAME}/backend:/app \
                          -w /app \
                          composer:2.7 composer install --no-interaction
                    """
                }
            }
        }

        stage('Backend - Run Tests') {
            steps {
                script {
                    // Use PHP image with MySQL PDO extension
                    sh """
                        docker run --rm \
                          --network reservationapp_app_network \
                          -v ${HOST_WORKSPACE}/workspace/${JOB_NAME}/backend:/app \
                          -w /app \
                          -e DB_CONNECTION=sqlite \
                          -e DB_DATABASE=:memory: \
                          php:8.3-cli \
                          sh -c '
                            apt-get update && apt-get install -y libzip-dev zip git unzip
                            docker-php-ext-install pdo_mysql zip
                            php -r "copy(\"https://getcomposer.org/installer\", \"composer-setup.php\");"
                            php composer-setup.php --install-dir=/usr/local/bin --filename=composer
                            composer install --no-interaction
                            vendor/bin/phpunit --testdox
                          ' || true
                    """
                }
            }
        }

        stage('Frontend - Install + Build') {
            steps {
                sh """
                    docker run --rm \
                      -v ${HOST_WORKSPACE}/workspace/${JOB_NAME}/frontend:/app \
                      -w /app \
                      node:20 sh -c 'npm install && npm run build'
                """
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    // Wait for SonarQube to be ready
                    sh """
                        echo '⏳ Waiting for SonarQube...'
                        until curl -s http://sonarqube:9000/api/system/status | grep -q UP; do
                            echo 'SonarQube not ready yet...'
                            sleep 5
                        done
                        echo '✅ SonarQube is ready!'
                    """

                    // Run SonarQube scanner
                    sh """
                        docker run --rm \
                          --network reservationapp_app_network \
                          -v ${HOST_WORKSPACE}/workspace/${JOB_NAME}/backend:/usr/src \
                          sonarsource/sonar-scanner-cli \
                          sonar-scanner \
                            -Dsonar.projectKey=reservationApp \
                            -Dsonar.sources=app \
                            -Dsonar.host.url=${SONAR_HOST_URL} \
                            -Dsonar.token=${SONAR_LOGIN}
                    """
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    sh """
                        cd ${WORKSPACE_PATH}
                        docker-compose -f docker-compose.yml build backend frontend
                    """
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    echo '🚀 Deploying application...'
                    sh """
                        cd ${WORKSPACE_PATH}
                        docker-compose -f docker-compose.yml up -d backend frontend nginx db
                    """
                }
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed!'
        }
        always {
            cleanWs()
        }
    }
}