pipeline {
    agent any

    environment {
        SONAR_HOST_URL = 'http://sonarqube:9000'
        SONAR_LOGIN = credentials('sonarqube-token')

        BRANCH_CLEAN = "${env.GIT_BRANCH?.replace('origin/', '').replace('/', '-')}"
        SONAR_PROJECT_KEY = "reservationApp-${BRANCH_CLEAN}"

        GRAFANA_URL = "http://kube-prometheus-stack-grafana.monitoring.svc.cluster.local:80"
        PROMETHEUS_PROXY = "/api/datasources/proxy/1/api/v1/query"

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
        stage('Monitoring - Grafana Health Check') {
            steps {
                script {
                    sh "echo Starting port-forward..."
                    sh "kubectl port-forward -n monitoring service/kube-prometheus-stack-grafana 9090:80 & sleep 5"

                    sh "echo Testing Grafana API..."
                    sh "curl -f http://localhost:9090/api/health"
                }
            }
        }

        stage('Monitoring - Grafana & Prometheus Health Check') {
            steps {
                script {
                    sh """
                        echo "Testing Grafana API..."
                        curl -f ${GRAFANA_URL}/api/health || exit 1
                        
                        echo "Testing Prometheus Datasource..."
                        curl -f ${GRAFANA_URL}/api/datasources || exit 1

                        echo "Testing Prometheus Metric 'up'..."
                        curl -f "${GRAFANA_URL}${PROMETHEUS_PROXY}?query=up" || exit 1

                        echo "Monitoring stack is healthy."
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
