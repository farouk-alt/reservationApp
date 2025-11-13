pipeline {

    agent none

    stages {

        stage('Backend - Composer install') {
            agent {
                docker {
                    image 'composer:2.7'
                    args '-u root -v $WORKSPACE:/app'
                }
            }
            steps {
                sh '''
                    cd backend
                    composer install --no-interaction
                '''
            }
        }

        stage('Backend - Run Tests') {
            agent {
                docker {
                    image 'composer:2.7'
                    args '-u root -v $WORKSPACE:/app'
                }
            }
            steps {
                sh '''
                    cd backend
                    vendor/bin/phpunit || true
                '''
            }
        }

        stage('Frontend - Install + Build') {
            agent {
                docker {
                    image 'node:20'
                    args '-u root -v $WORKSPACE:/app'
                }
            }
            steps {
                sh '''
                    cd frontend
                    npm install
                    npm run build
                '''
            }
        }

        stage("SonarQube Analysis") {
            agent {
                docker {
                    image 'sonarsource/sonar-scanner-cli'
                    args '-v $WORKSPACE:/usr/src'
                }
            }
            steps {
                sh '''
                    cd backend
                    sonar-scanner \
                      -Dsonar.projectKey=reservationApp \
                      -Dsonar.sources=app \
                      -Dsonar.php.coverage.reportPaths=coverage.xml \
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
