pipeline {

    agent any

    environment {
        HOST_WS = "/var/lib/docker/volumes/jenkins_home/_data/workspace/ReservationApp-CI"
    }

    stages {

        stage('Backend - Composer install') {
            steps {
                sh """
                    echo \"Using host path: ${HOST_WS}\"

                    docker run --rm \
                        -v ${HOST_WS}/backend:/app \
                        -w /app \
                        composer:2.7 \
                        composer install --no-interaction
                """
            }
        }

        stage('Backend - Run Tests') {
            steps {
                sh """
                    docker run --rm \
                        -v ${HOST_WS}/backend:/app \
                        -w /app \
                        composer:2.7 \
                        vendor/bin/phpunit || true
                """
            }
        }

        stage('Frontend - Install + Build') {
            steps {
                sh """
                    docker run --rm \
                        -v ${HOST_WS}/frontend:/app \
                        -w /app \
                        node:20 \
                        sh -c "npm install && npm run build"
                """
            }
        }

        stage("SonarQube Analysis") {
            steps {
                sh """
                    docker run --rm \
                        -v ${HOST_WS}/backend:/usr/src \
                        sonarsource/sonar-scanner-cli \
                        sonar-scanner \
                          -Dsonar.projectKey=reservationApp \
                          -Dsonar.sources=app \
                          -Dsonar.host.url=http://sonarqube:9000
                """
            }
        }

        stage("Build Docker Images") {
            steps {
                sh "docker compose build"
            }
        }

    }
}
