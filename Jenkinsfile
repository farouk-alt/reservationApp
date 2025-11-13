pipeline {

    agent any

    environment {
        WORKDIR = "/var/jenkins_home/workspace/ReservationApp-CI"
    }

    stages {

        /* -------------------- BACKEND INSTALL -------------------- */

        stage('Backend - Composer install') {
            steps {
                sh """
                    docker run --rm \
                        -u root \
                        -v ${env.WORKDIR}:/workspace \
                        -w /workspace/backend \
                        composer:2.7 \
                        composer install --no-interaction
                """
            }
        }

        /* -------------------- BACKEND TESTS -------------------- */

        stage('Backend - Run Tests') {
            steps {
                sh """
                    docker run --rm \
                        -u root \
                        -v ${env.WORKDIR}:/workspace \
                        -w /workspace/backend \
                        composer:2.7 \
                        vendor/bin/phpunit || true
                """
            }
        }

        /* -------------------- FRONTEND -------------------- */

        stage('Frontend - Install + Build') {
            steps {
                sh """
                    docker run --rm \
                        -u root \
                        -v ${env.WORKDIR}:/workspace \
                        -w /workspace/frontend \
                        node:20 \
                        sh -c "npm install && npm run build"
                """
            }
        }

        /* -------------------- SONAR -------------------- */

        stage("SonarQube Analysis") {
            steps {
                sh """
                    docker run --rm \
                        -v ${env.WORKDIR}:/workspace \
                        -w /workspace/backend \
                        sonarsource/sonar-scanner-cli \
                        sonar-scanner \
                          -Dsonar.projectKey=reservationApp \
                          -Dsonar.sources=app \
                          -Dsonar.host.url=http://sonarqube:9000
                """
            }
        }

        /* -------------------- BUILD DOCKER IMAGES -------------------- */

        stage("Build Docker Images") {
            steps {
                sh "docker compose build"
            }
        }
    }
}
