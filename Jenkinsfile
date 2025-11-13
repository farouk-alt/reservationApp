pipeline {

    agent any

    stages {

        stage('Backend - Composer install') {
            steps {
                sh """
                    echo "Workspace = ${env.WORKSPACE}"
                    ls -al ${env.WORKSPACE}

                    docker run --rm \
                        -u root \
                        -v ${env.WORKSPACE}:/workspace \
                        -w /workspace/backend \
                        composer:2.7 \
                        composer install --no-interaction
                """
            }
        }

        stage('Backend - Run Tests') {
            steps {
                sh """
                    docker run --rm \
                        -u root \
                        -v ${env.WORKSPACE}:/workspace \
                        -w /workspace/backend \
                        composer:2.7 \
                        vendor/bin/phpunit || true
                """
            }
        }

        stage('Frontend - Install + Build') {
            steps {
                sh """
                    docker run --rm \
                        -u root \
                        -v ${env.WORKSPACE}:/workspace \
                        -w /workspace/frontend \
                        node:20 \
                        sh -c "npm install && npm run build"
                """
            }
        }

        stage("SonarQube Analysis") {
            steps {
                sh """
                    docker run --rm \
                        -v ${env.WORKSPACE}:/workspace \
                        -w /workspace/backend \
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
