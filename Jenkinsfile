pipeline {
    agent any
    
    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        DB_HOST = 'mysql'
        DB_PORT = '3306'
        DB_NAME = 'gestion_reservations'
        DB_USER = 'root'
        DB_PASSWORD = 'root_password'
    }
    
    stages {
        stage('🔍 Checkout') {
            steps {
                echo '📥 Récupération du code source...'
                checkout scm
            }
        }
        
        stage('🧹 Cleanup') {
            steps {
                echo '🧹 Nettoyage des conteneurs existants...'
                sh '''
                    docker-compose -f ${DOCKER_COMPOSE_FILE} down -v || true
                    docker system prune -f
                '''
            }
        }
        
        stage('🐳 Build Docker Images') {
            steps {
                echo '🔨 Construction des images Docker...'
                sh '''
                    docker-compose -f ${DOCKER_COMPOSE_FILE} build --no-cache backend
                '''
            }
        }
        
        stage('🗄️ Start MySQL') {
            steps {
                echo '🚀 Démarrage de MySQL...'
                sh '''
                    docker-compose -f ${DOCKER_COMPOSE_FILE} up -d mysql
                    echo "Attente du démarrage de MySQL..."
                    sleep 30
                '''
            }
        }
        
        stage('🔄 Database Migration - Liquibase') {
            steps {
                script {
                    echo '📦 Application des migrations Liquibase...'
                    sh '''
                        docker-compose -f ${DOCKER_COMPOSE_FILE} run --rm backend \
                        liquibase \
                        --changeLogFile=database/liquibase/changelog.xml \
                        --url=jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME} \
                        --username=${DB_USER} \
                        --password=${DB_PASSWORD} \
                        --classpath=/opt/liquibase/lib/mysql-connector-j-9.1.0.jar \
                        update
                    '''
                    
                    echo '✅ Migrations Liquibase appliquées avec succès !'
                    
                    // Vérifier l'historique des migrations
                    sh '''
                        docker-compose -f ${DOCKER_COMPOSE_FILE} run --rm backend \
                        liquibase \
                        --changeLogFile=database/liquibase/changelog.xml \
                        --url=jdbc:mysql://${DB_HOST}:${DB_PORT}/${DB_NAME} \
                        --username=${DB_USER} \
                        --password=${DB_PASSWORD} \
                        history
                    '''
                }
            }
        }
        
        stage('🧪 Tests Backend') {
            steps {
                echo '🧪 Exécution des tests PHPUnit...'
                sh '''
                    docker-compose -f ${DOCKER_COMPOSE_FILE} run --rm backend \
                    php artisan test
                '''
            }
        }
        
        stage('📊 SonarQube Analysis') {
            steps {
                echo '📊 Analyse de la qualité du code...'
                script {
                    // Configuration SonarQube
                    sh '''
                        echo "Analyse SonarQube en cours..."
                        # Ajouter ici la commande SonarQube si configuré
                    '''
                }
            }
        }
        
        stage('🎨 Build Frontend') {
            steps {
                echo '🎨 Construction du frontend React...'
                sh '''
                    docker-compose -f ${DOCKER_COMPOSE_FILE} build frontend
                '''
            }
        }
        
        stage('🚀 Deploy to Staging') {
            steps {
                echo '🚀 Déploiement sur l\'environnement de staging...'
                sh '''
                    docker-compose -f ${DOCKER_COMPOSE_FILE} up -d
                    echo "Application déployée sur http://localhost:8080"
                '''
            }
        }
        
        stage('✅ Health Check') {
            steps {
                echo '🏥 Vérification de la santé de l\'application...'
                sh '''
                    sleep 10
                    curl -f http://localhost:8080 || exit 1
                    echo "✅ Application opérationnelle !"
                '''
            }
        }
    }
    
    post {
        success {
            echo '✅ ========================================='
            echo '✅ Pipeline exécuté avec succès !'
            echo '✅ ========================================='
            echo '📊 Résumé :'
            echo '   - Migrations Liquibase : ✅ Appliquées'
            echo '   - Tests Backend : ✅ Réussis'
            echo '   - Application : ✅ Déployée'
            echo '========================================='
        }
        
        failure {
            echo '❌ ========================================='
            echo '❌ Le pipeline a échoué !'
            echo '❌ ========================================='
            sh '''
                echo "Logs des conteneurs :"
                docker-compose -f ${DOCKER_COMPOSE_FILE} logs
            '''
        }
        
        always {
            echo '🧹 Nettoyage final...'
            // Optionnel : Arrêter les conteneurs après les tests
            // sh 'docker-compose -f ${DOCKER_COMPOSE_FILE} down'
        }
    }
}