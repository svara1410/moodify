pipeline {
    agent any

    environment {
        SONAR_TOKEN = credentials('SONAR_TOKEN')
        APP_PORT = "3000"
        CONTAINER_NAME = "monitoring"
    }

    stages {
        stage('Checkout SCM') {
            steps {
                git url: 'https://github.com/svara1410/moodify.git', branch: 'main'
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
                    bat """
                        sonar-scanner ^
                        -Dsonar.projectKey=moodify ^
                        -Dsonar.sources=. ^
                        -Dsonar.host.url=http://localhost:9000 ^
                        -Dsonar.token=%SONAR_TOKEN%
                    """
                }
            }
        }

        stage('Docker Build') {
            steps {
                echo 'Building Docker image...'
                bat "docker build -t moodify-app ."
            }
        }

        stage('Docker Run') {
            steps {
                echo 'Running Docker container...'
                bat """
                    REM Stop and remove old container if exists
                    docker stop %CONTAINER_NAME% || exit 0
                    docker rm %CONTAINER_NAME% || exit 0

                    REM Run container in detached mode
                    docker run -d -p %APP_PORT%:%APP_PORT% --name %CONTAINER_NAME% moodify-app
                """
            }
        }

        stage('Health Check') {
            steps {
                script {
                    def maxRetries = 6
                    def retryCount = 0
                    def appUp = false

                    while (retryCount < maxRetries && !appUp) {
                        try {
                            echo "Checking application health (attempt ${retryCount + 1})..."
                            bat "curl -s http://localhost:%APP_PORT% > NUL"
                            appUp = true
                            echo "✅ Application is up!"
                        } catch (Exception e) {
                            retryCount++
                            if (retryCount < maxRetries) {
                                echo "App not ready yet, waiting 5 seconds..."
                                sleep 5
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
        always {
            echo 'Cleaning up...'
            bat """
                docker stop %CONTAINER_NAME% || exit 0
                docker rm %CONTAINER_NAME% || exit 0
            """
        }
    }
}
