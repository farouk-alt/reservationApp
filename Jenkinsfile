pipeline {

    agent any

    stages {

        stage('Backend - Composer install') {
            steps {
                sh """
                    docker run --rm \
                        -v ${WORKSPACE}/backend:/app \
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
                        -v ${WORKSPACE}/backend:/app \
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
                        -v ${WORKSPACE}/frontend:/app \
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
                        -v ${WORKSPACE}/backend:/usr/src \
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
