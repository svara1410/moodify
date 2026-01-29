pipeline {
    agent any

    tools {
        nodejs 'node' // NodeJS installation in Jenkins Tools
    }

    environment {
        SONAR_TOKEN = credentials('SONAR_TOKEN')
        DOCKER_USER = credentials('DOCKER_USER') // Docker Hub username
        DOCKER_PASS = credentials('DOCKER_PASS') // Docker Hub password
    }

    options {
        skipDefaultCheckout()
        timestamps()
        ansiColor('xterm')
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
                echo 'Installing dependencies with caching...'
                bat 'npm ci --cache .npm-cache'
            }
        }

        stage('Quality & Tests') {
            parallel {

                stage('Frontend Tests') {
                    steps {
                        echo 'Running frontend tests...'
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

            }
        }

        stage('Docker Build') {
            when { branch 'main' }
            steps {
                echo 'Building Docker image...'
                bat 'docker build -t moodify-app .'
            }
        }

        stage('Docker Push') {
            when { branch 'main' }
            steps {
                echo 'Pushing Docker image to registry...'
                bat """
                docker login -u %DOCKER_USER% -p %DOCKER_PASS%
                docker tag moodify-app moodify-app:latest
                docker push moodify-app:latest
                """
            }
        }

        stage('Monitoring') {
            steps {
                echo 'Starting container and checking health...'
                bat """
                docker stop monitoring 2>NUL || echo No container to stop
                docker rm monitoring 2>NUL || echo No container to remove
                docker run -d --name monitoring -p 3000:3000 moodify-app
                """

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

        stage('Archive Artifacts') {
            steps {
                echo 'Archiving build artifacts...'
                archiveArtifacts artifacts: '**/dist/**', fingerprint: true
            }
        }
    }

    post {
        always {
            echo 'Cleaning up Docker containers...'
            bat """
            docker stop monitoring 2>NUL || echo No container to stop
            docker rm monitoring 2>NUL || echo No container to remove
            """
        }
        success {
            echo 'Pipeline Succeeded! 🎉'
            // slackSend(channel: '#moodify', message: 'Pipeline Successful ✅') // optional
        }
        failure {
            echo 'Pipeline Failed ❌'
            // slackSend(channel: '#moodify', message: 'Pipeline Failed ❌') // optional
        }
    }
}
