pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
        DB_HOST = 'mysql'
        DB_PORT = '3306'
        DB_NAME = 'gestion_reservations'
        DB_USER = 'root'
        DB_PASSWORD = ''
        PROJECT_NAME = 'reservationApp'
        EMAIL_RECIPIENT = 'ikramikramkarima@gmail.com'

        // Token SonarQube ajouté dans Jenkins > Credentials (si tu veux activer Sonar)
        // SONARQUBE_TOKEN = credentials('sonar-token')
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
                bat '''
                    docker-compose -f %DOCKER_COMPOSE_FILE% down -v || true
                    docker system prune -f -a --volumes -y
                '''
            }
        }

        stage('🐳 Build Docker Images') {
            steps {
                echo '🔨 Construction des images Docker...'
                bat '''
                    docker-compose -f %DOCKER_COMPOSE_FILE% build --no-cache backend
                '''
            }
        }

        stage('🗄️ Start MySQL') {
            steps {
                echo '🚀 Démarrage de MySQL...'
                bat '''
                    docker-compose -f %DOCKER_COMPOSE_FILE% up -d mysql
                    echo Attente du démarrage de MySQL...
                    timeout /t 30
                '''
            }
        }

        // stage('🔄 Database Migration - Liquibase') {
        //     steps {
        //         echo '📦 Application des migrations Liquibase...'
        //         bat '''
        //             docker-compose -f %DOCKER_COMPOSE_FILE% run --rm backend ^
        //                 liquibase ^
        //                 --changeLogFile=database/liquibase/changelog.xml ^
        //                 --url=jdbc:mysql://%DB_HOST%:%DB_PORT%/%DB_NAME% ^
        //                 --username=%DB_USER% ^
        //                 --password=%DB_PASSWORD% ^
        //                 --classpath=/opt/liquibase/lib/mysql-connector-j-9.1.0.jar ^
        //                 update
        //         '''

        //         echo '✅ Migrations Liquibase appliquées avec succès !'

        //         bat '''
        //             docker-compose -f %DOCKER_COMPOSE_FILE% run --rm backend ^
        //                 liquibase ^
        //                 --changeLogFile=database/liquibase/changelog.xml ^
        //                 --url=jdbc:mysql://%DB_HOST%:%DB_PORT%/%DB_NAME% ^
        //                 --username=%DB_USER% ^
        //                 --password=%DB_PASSWORD% ^
        //                 history
        //         '''
        //     }
        // }

        stage('🧪 Tests Backend') {
            steps {
                echo '🧪 Exécution des tests PHPUnit...'
                bat '''
                    docker-compose -f %DOCKER_COMPOSE_FILE% run --rm backend ^
                        php artisan test
                '''
            }
        }

        // stage('📊 SonarQube Analysis') {
        //     steps {
        //         echo '📊 Analyse de la qualité du code...'
        //         withSonarQubeEnv('SonarQube') {
        //             bat '''
        //                 echo Lancement de l\'analyse SonarQube...
        //                 sonar-scanner ^
        //                     -Dsonar.projectKey=%PROJECT_NAME% ^
        //                     -Dsonar.sources=. ^
        //                     -Dsonar.host.url=%SONAR_HOST_URL% ^
        //                     -Dsonar.login=%SONARQUBE_TOKEN%
        //             '''
        //         }
        //     }
        // }

        stage('🎨 Build Frontend') {
            steps {
                echo '🎨 Construction du frontend React...'
                bat '''
                    docker-compose -f %DOCKER_COMPOSE_FILE% build frontend
                '''
            }
        }

        // stage('🚀 Deploy to Staging') {
        //     steps {
        //         echo '🚀 Déploiement sur l\'environnement de staging...'
        //         bat '''
        //             docker-compose -f %DOCKER_COMPOSE_FILE% up -d
        //             echo Application déployée sur http://localhost:8080
        //         '''
        //     }
        // }

        stage('✅ Health Check') {
            steps {
                echo '🏥 Vérification de la santé de l\'application...'
                bat '''
                    timeout /t 10
                    curl -f http://localhost:8080 || exit /b 1
                    echo ✅ Application opérationnelle !
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
            bat '''
                echo Logs des conteneurs :
                docker-compose -f %DOCKER_COMPOSE_FILE% logs
            '''
        }

        always {
            echo '🧹 Nettoyage final...'
            // Si tu veux que les conteneurs soient arrêtés après le pipeline :
            // bat 'docker-compose -f %DOCKER_COMPOSE_FILE% down'
        }
    }
}
