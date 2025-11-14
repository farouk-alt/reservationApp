pipeline {
    agent any

    environment {
        SONAR_HOST_URL = 'http://sonarqube:9000'
        SONAR_LOGIN = credentials('sonarqube-token')

        BRANCH_CLEAN = "${env.GIT_BRANCH?.replace('origin/', '').replace('/', '-')}"
        SONAR_PROJECT_KEY = "reservationApp-${BRANCH_CLEAN}"
    }

    stages {

        stage('Checkout SCM') {
            steps {
                checkout scm
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    withSonarQubeEnv('SonarQube') {
                        sh """
                            sonar-scanner \
                                -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                                -Dsonar.host.url=${SONAR_HOST_URL} \
                                -Dsonar.token=${SONAR_LOGIN}
                        """
                    }
                }
            }
        }

        stage('Backend - Install Dependencies') {
            steps {
                dir('backend') {
                    sh """
                        composer install --no-interaction --prefer-dist
                    """
                }
            }
        }

        stage('Frontend - Build') {
            steps {
                dir('frontend') {
                    sh """
                        npm install
                        npm run build
                    """
                }
            }
        }

        stage('Liquibase Migration') {
            steps {
                dir('backend') {
                    sh """
                        liquibase \
                         --classpath=/usr/lib/mysql-connector-j-8.0.33.jar \
                          --defaultsFile=liquibase.properties \
                          update
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
    }
}
