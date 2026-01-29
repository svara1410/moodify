pipeline {
    agent any

    tools {
        nodejs 'node' // Make sure NodeJS is installed in Jenkins Tools
    }

    environment {
        SONAR_TOKEN = credentials('SONAR_TOKEN') // This ID must exist in Jenkins
    }

    options {
        skipDefaultCheckout()
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/svara1410/moodify.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('Frontend Tests') {
            steps {
                echo 'Running single Navbar test...'
                // Run only the frontend test we made, with coverage
                bat 'npm test -- --coverage --watchAll=false'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN')]) {
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
        }

        stage('Docker Build') {
            steps {
                // Kept exactly as you had it
                bat 'docker build -t moodify-app .'
            }
        }

        stage('Monitoring') {
            steps {
                // Run container exactly as you had it
                bat """
                docker stop monitoring 2>NUL || echo No container to stop
                docker rm monitoring 2>NUL || echo No container to remove
                docker run -d --name monitoring -p 3000:3000 moodify-app
                """

                // Health check
                script {
                    def maxRetries = 6
                    def waitTime = 5
                    def healthy = false

                    for (int i = 1; i <= maxRetries; i++) {
                        echo "Checking application health (attempt ${i})..."
                        def result = bat(script: "curl -s http://localhost:3000 > nul", returnStatus: true)
                        if (result == 0) {
                            healthy = true
                            echo "✅ Application is up!"
                            break
                        } else {
                            echo "App not ready yet, waiting ${waitTime} seconds..."
                            sleep(waitTime)
                        }
                    }

                    if (!healthy) {
                        echo "❌ Application did not start in time. Showing container logs..."
                        bat 'docker logs monitoring'
                        error("Application failed health check")
                    }
                }
            }
        }
    }

    post {
        always {
            // Removed node { } → works fine in Declarative
            echo 'Cleaning up...'
            bat """
            docker stop monitoring 2>NUL || echo No container to stop
            docker rm monitoring 2>NUL || echo No container to remove
            """
        }
    }
}
