pipeline {
    agent any

    environment {
        SONAR_TOKEN = credentials('SONAR_TOKEN') // Your SonarQube token
        APP_PORT = "3000"
        CONTAINER_NAME = "moodify-container"
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
                        -Dsonar.login=%SONAR_TOKEN%
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
                    docker stop %CONTAINER_NAME% || exit 0
                    docker rm %CONTAINER_NAME% || exit 0
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
