pipeline {
    agent any

    environment {
        SONAR_HOST_URL = 'http://host.docker.internal:9000'
        SONAR_LOGIN = credentials('sonar-token')

        BRANCH_CLEAN = "${env.GIT_BRANCH?.replace('origin/', '').replace('/', '-')}"
        SONAR_PROJECT_KEY = "reservationApp-${BRANCH_CLEAN}"

        GRAFANA_URL = "http://kube-prometheus-stack-grafana.monitoring.svc.cluster.local:80"
        PROMETHEUS_PROXY = "/api/datasources/proxy/1/api/v1/query"
    }

    stages {

        stage('Checkout SCM') {
            steps { checkout scm }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    withSonarQubeEnv('sonarqube') {
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
                    sh "composer install --no-interaction --prefer-dist"
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

        stage('Wait for Monitoring Stack') {
            steps {
                script {
                    sh """
                    echo '⏳ Waiting for Prometheus & Alertmanager...'

                    # Wait for Prometheus
                    until kubectl get pods -n monitoring | grep prometheus-monitoring-kube-prometheus-prometheus | grep '2/2'; do
                      echo 'Waiting for Prometheus...'
                      sleep 5
                    done

                    # Wait for Alertmanager
                    until kubectl get pods -n monitoring | grep alertmanager-monitoring-kube-prometheus-alertmanager | grep '2/2'; do
                      echo 'Waiting for Alertmanager...'
                      sleep 5
                    done

                    echo '✅ Monitoring stack is fully ready!'
                    """
                }
            }
        }
        stage('Redeploy Monitoring Stack') {
            steps {
                script {
                    sh """
                        echo "🚀 Updating Helm repositories..."
                        helm repo update

                        echo "🔄 Redeploying Grafana & Prometheus..."
                        helm upgrade monitoring prometheus-community/kube-prometheus-stack -n monitoring --install

                        echo "⏳ Waiting for Grafana to restart..."
                        kubectl rollout status deploy/monitoring-grafana -n monitoring --timeout=120s

                        echo "⏳ Waiting for Prometheus to restart..."
                        kubectl rollout status statefulset/prometheus-monitoring-kube-prometheus-prometheus -n monitoring --timeout=120s

                        echo "⏳ Waiting for Alertmanager to restart..."
                        kubectl rollout status statefulset/alertmanager-monitoring-kube-prometheus-alertmanager -n monitoring --timeout=120s

                        echo "✅ Monitoring stack redeployed!"
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
        success { echo '✅ Pipeline completed successfully!' }
        failure { echo '❌ Pipeline failed!' }
    }
}
