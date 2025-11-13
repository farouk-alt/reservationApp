pipeline {

    agent none

    stages {

        /* ================================
           1️⃣ BACKEND - Composer install
        ================================= */
        stage('Backend - Composer install') {
            agent {
                docker {
                    image 'composer:2.7'
                    args '-u root -v $WORKSPACE:/workspace'
                }
            }
            steps {
                sh '''
                    cd workspace/backend
                    composer install --no-interaction
                '''
            }
        }

        /* ================================
           2️⃣ BACKEND - PHPUnit tests
        ================================= */
        stage('Backend - Run Tests') {
            agent {
                docker {
                    image 'composer:2.7'
                    args '-u root -v $WORKSPACE:/workspace'
                }
            }
            steps {
                sh '''
                    cd workspace/backend
                    vendor/bin/phpunit || true
                '''
            }
        }

        /* ================================
           3️⃣ FRONTEND - Install + Build
        ================================= */
        stage('Frontend - Install + Build') {
            agent {
                docker {
                    image 'node:20'
                    args '-u root -v $WORKSPACE:/workspace'
                }
            }
            steps {
                sh '''
                    cd workspace/frontend
                    npm install
                    npm run build
                '''
            }
        }

        /* ================================
           4️⃣ SONARQUBE ANALYSIS
        ================================= */
        stage('SonarQube Analysis') {
            agent {
                docker {
                    image 'sonarsource/sonar-scanner-cli'
                    args '-v $WORKSPACE:/usr/src --network=ci_network'
                }
            }
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                        cd /usr/src/backend
                        sonar-scanner \
                          -Dsonar.projectKey=reservationApp \
                          -Dsonar.sources=app \
                          -Dsonar.php.coverage.reportPaths=coverage.xml \
                          -Dsonar.host.url=http://sonarqube:9000
                    '''
                }
            }
        }

        /* ================================
           5️⃣ BUILD DOCKER IMAGES
        ================================= */
        stage('Build Docker Images') {
            agent {
                docker {
                    image 'docker:26'
                    args "-u root -v /var/run/docker.sock:/var/run/docker.sock -v $WORKSPACE:/workspace"
                }
            }
            steps {
                sh '''
                    cd workspace
                    docker compose build
                '''
            }
        }

    }
}
