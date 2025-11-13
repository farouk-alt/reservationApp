pipeline {

    agent any   // <= FIX: ensures WORKSPACE exists

    stages {

        stage('Backend - Composer install') {
            agent {
                docker {
                    image 'composer:2.7'
                    args "--entrypoint='' -u root -v ${env.WORKSPACE}:/app"
                }
            }
            steps {
                sh '''
                    cd /app/backend
                    composer install --no-interaction
                '''
            }
        }

        stage('Backend - Run Tests') {
            agent {
                docker {
                    image 'composer:2.7'
                    args "--entrypoint='' -u root -v ${env.WORKSPACE}:/app"
                }
            }
            steps {
                sh '''
                    cd /app/backend
                    vendor/bin/phpunit || true
                '''
            }
        }

        stage('Frontend - Install + Build') {
            agent {
                docker {
                    image 'node:20'
                    args "--entrypoint='' -u root -v ${env.WORKSPACE}:/app"
                }
            }
            steps {
                sh '''
                    cd /app/frontend
                    npm install
                    npm run build
                '''
            }
        }

        stage("SonarQube Analysis") {
            agent {
                docker {
                    image 'sonarsource/sonar-scanner-cli'
                    args "--entrypoint='' -v ${env.WORKSPACE}:/usr/src"
                }
            }
            steps {
                sh '''
                    cd /usr/src/backend
                    sonar-scanner \
                      -Dsonar.projectKey=reservationApp \
                      -Dsonar.sources=app \
                      -Dsonar.host.url=http://sonarqube:9000
                '''
            }
        }

        stage("Build Docker Images") {
            agent any
            steps {
                sh 'docker compose build'
            }
        }
    }
}
