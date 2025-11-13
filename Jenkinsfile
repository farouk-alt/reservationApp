pipeline {
    agent any

    environment {
        SONAR_HOST_URL = 'http://localhost:9000'
        SONAR_SCANNER = tool 'SonarScanner'
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/farouk-alt/reservationApp.git'
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                sh '''
                    cd backend
                    composer install --no-interaction
                '''
            }
        }

        stage('Run Backend Tests') {
            steps {
                sh '''
                    cd backend
                    php artisan test || true
                '''
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                sh '''
                    cd frontend
                    npm install
                    npm run build
                '''
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        cd backend
                        $SONAR_SCANNER/bin/sonar-scanner \
                          -Dsonar.projectKey=reservationApp \
                          -Dsonar.sources=app \
                          -Dsonar.php.coverage.reportPaths=coverage.xml \
                          -Dsonar.host.url=$SONAR_HOST_URL
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 3, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    docker compose build
                '''
            }
        }
    }
}
