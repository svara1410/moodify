pipeline {
    agent any

    environment {
        SONARQUBE = 'SonarQube' // Your SonarQube server name in Jenkins
        SONAR_TOKEN = credentials('SONAR_TOKEN') // Jenkins credential ID
        IMAGE_NAME = "moodify-app"
        CONTAINER_NAME = "moodify-container"
        APP_PORT = 3000
    }

    stages {

        stage('Checkout SCM') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing npm dependencies...'
                bat 'npm install'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    bat """sonar-scanner ^
                        -Dsonar.projectKey=moodify ^
                        -Dsonar.sources=. ^
                        -Dsonar.host.url=http://localhost:9000 ^
                        -Dsonar.login=%SONAR_TOKEN%"""
                }
            }
        }

        stage('Docker Build') {
            steps {
                echo 'Building Docker image...'
                bat "docker build -t %IMAGE_NAME% ."
            }
        }

        stage('Docker Run') {
            steps {
                echo 'Running Docker container...'
                bat """
                    docker stop %CONTAINER_NAME% || exit 0
                    docker rm %CONTAINER_NAME% || exit 0
                    docker run -d -p %APP_PORT%:%APP_PORT% --name %CONTAINER_NAME% %IMAGE_NAME%
                """
            }
        }

        stage('Monitoring & Metrics Validation') {
            steps {
                echo 'Validating application health...'
                script {
                    def maxRetries = 6
                    def retryCount = 0
                    def appUp = false

                    while (retryCount < maxRetries && !appUp) {
                        try {
                            echo "Checking application health (attempt ${retryCount + 1})..."
                            bat "curl http://localhost:%APP_PORT% -f"
                            appUp = true
                            echo "✅ Application is up!"
                        } catch (Exception e) {
                            retryCount++
                            if (retryCount < maxRetries) {
                                echo "App not ready yet, waiting 5 seconds..."
                                bat "timeout /t 5 /nobreak"
                            } else {
                                echo "❌ Application did not start in time. Showing container logs..."
                                bat "docker logs %CONTAINER_NAME%"
                                error "Application health check failed!"
                            }
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            echo "🎉 Pipeline completed successfully!"
        }
        failure {
            echo "❌ Pipeline failed. Check logs above."
            bat "docker logs %CONTAINER_NAME%"
        }
        always {
            echo "Cleaning up..."
            bat """
                docker stop %CONTAINER_NAME% || exit 0
                docker rm %CONTAINER_NAME% || exit 0
            """
        }
    }
}
