pipeline {
    agent any

    environment {
        APP_PORT = "3000"
        CONTAINER_NAME = "monitoring"
        SONARQUBE_SCANNER = "SonarQube"
    }

    stages {
        stage('Checkout SCM') {
            steps {
                echo 'Checking out source code...'
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
                withSonarQubeEnv("${SONARQUBE_SCANNER}") {
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
                bat 'docker build -t moodify-app .'
            }
        }

        stage('Docker Run') {
            steps {
                echo 'Running Docker container...'
                bat """
                    docker stop %CONTAINER_NAME% 2> NUL
                    docker rm %CONTAINER_NAME% 2> NUL
                    docker run -d -p %APP_PORT%:%APP_PORT% --name %CONTAINER_NAME% moodify-app
                """
            }
        }

        stage('Health Check') {
            steps {
                script {
                    def maxRetries = 12
                    def retryCount = 0
                    def appUp = false

                    while(retryCount < maxRetries && !appUp) {
                        echo "Checking application health (attempt ${retryCount+1})..."
                        def status = bat(returnStatus: true, script: "curl -s http://localhost:%APP_PORT% 1>NUL")
                        if (status == 0) {
                            echo '✅ Application is up and running!'
                            appUp = true
                        } else {
                            echo 'App not ready yet, waiting 5 seconds...'
                            sleep 5
                            retryCount++
                        }
                    }

                    if (!appUp) {
                        echo '❌ Application did not start in time. Showing container logs...'
                        bat "docker logs %CONTAINER_NAME%"
                        error('Application failed to start.')
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up...'
            bat """
                docker stop %CONTAINER_NAME% 2> NUL
                docker rm %CONTAINER_NAME% 2> NUL
            """
        }
    }
}
