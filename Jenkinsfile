pipeline {

    agent none

    stages {

        stage('Backend - Composer install') {
            agent {
                docker {
                    image 'composer:2.7'
                    args '-u root -v /var/jenkins_home/workspace/ReservationApp-CI:/workspace'
                }
            }
            steps {
                sh '''
                    cd /workspace/backend
                    composer install --no-interaction
                '''
            }
        }

        stage('Backend - Run Tests') {
            agent {
                docker {
                    image 'composer:2.7'
                    args '-u root -v /var/jenkins_home/workspace/ReservationApp-CI:/workspace'
                }
            }
            steps {
                sh '''
                    cd /workspace/backend
                    vendor/bin/phpunit || true
                '''
            }
        }

        stage('Frontend - Install + Build') {
            agent {
                docker {
                    image 'node:20'
                    args '-u root -v /var/jenkins_home/workspace/ReservationApp-CI:/workspace'
                }
            }
            steps {
                sh '''
                    cd /workspace/frontend
                    npm install
                    npm run build
                '''
            }
        }

        stage("SonarQube Analysis") {
            agent {
                docker {
                    image 'sonarsource/sonar-scanner-cli'
                    args '-u root -v /var/jenkins_home/workspace/ReservationApp-CI:/workspace'
                }
            }
            steps {
                sh '''
                    cd /workspace/backend
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
                sh '''
                    cd /var/jenkins_home/workspace/ReservationApp-CI
                    docker compose build
                '''
            }
        }
    }
}
