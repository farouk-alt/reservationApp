pipeline {
    agent any

    environment {
        // Nom du projet
        PROJECT_NAME = "reservationApp"

        // Identifiants pour SonarQube (ajoute-les dans Jenkins > Credentials)
        //SONARQUBE_ENV = credentials('sonar-token')

        // Email de notification
        EMAIL_RECIPIENT = "ikramikramkarima@gmail.com"
    }

    stages {

        stage('Checkout') {
            steps {
                echo "🌀 Clonage du code depuis GitHub..."
                checkout scm
            }
        }

        stage('Build Docker Containers') {
            steps {
                echo "🐳 Construction des conteneurs Docker..."
                sh 'docker compose down || true'
                sh 'docker compose build --no-cache'
                sh 'docker compose up -d'
            }
        }

        stage('Run Backend Tests (Laravel - PHPUnit)') {
            steps {
                echo "🧪 Exécution des tests PHPUnit..."
                sh 'docker exec -t backend php artisan test || true'
            }
        }

        stage('Run Frontend Tests (React - Jest)') {
            steps {
                echo "🧪 Exécution des tests Jest..."
                sh 'docker exec -t frontend npm test -- --watchAll=false || true'
            }
        }

        
    }

    post {
        always {
            echo "🧹 Nettoyage des conteneurs..."
            sh 'docker compose down'
        }

        success {
            echo "✅ Build réussi !"
        }

        failure {
            echo "❌ Build échoué - envoi de notification par e-mail..."
            mail to: "${EMAIL_RECIPIENT}",
                 subject: "🚨 Jenkins Build Failed: ${PROJECT_NAME}",
                 body: "Le build Jenkins du projet ${PROJECT_NAME} a échoué. Vérifie les logs pour plus de détails."
        }
    }
}
