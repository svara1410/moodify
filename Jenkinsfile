pipeline {
    agent any

    tools {
        nodejs 'node' // Make sure NodeJS is installed in Jenkins Tools
    }

    environment {
        SONAR_TOKEN = credentials('SONAR_TOKEN')
        DOCKER_USER = 'svara1410'
        DOCKER_PASS = 'Svara@1410'
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
                wrap([$class: 'AnsiColorBuildWrapper', 'colorMapName': 'xterm']) {
                    echo 'Installing dependencies with caching...'
                    bat 'npm ci --cache .npm-cache'
                }
            }
        }

        stage('Quality & Tests') {
            parallel {

                stage('Frontend Tests') {
                    steps {
                        wrap([$class: 'AnsiColorBuildWrapper', 'colorMapName': 'xterm']) {
                            echo 'Running frontend tests...'
                            bat 'npm test -- --coverage --watchAll=false'
                        }
                    }
                }

                stage('SonarQube Analysis') {
                    steps {
                        wrap([$class: 'AnsiColorBuildWrapper', 'colorMapName': 'xterm']) {
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
        }

        stage('Docker Build') {
            when { branch 'main' }
            steps {
                wrap([$class: 'AnsiColorBuildWrapper', 'colorMapName': 'xterm']) {
                    echo 'Building Docker image...'
                    bat 'docker build -t moodify-app .'
                }
            }
        }

        stage('Docker Push') {
            when { branch 'main' }
            steps {
                wrap([$class: 'AnsiColorBuildWrapper', 'colorMapName': 'xterm']) {
                    echo 'Logging in and pushing Docker image...'
                    bat """
                    docker login -u %DOCKER_USER% -p %DOCKER_PASS%
                    docker tag moodify-app svara1410/moodify-app:latest
                    docker push svara1410/moodify-app:latest
                    """
                }
            }
        }

        stage('Monitoring') {
            steps {
                wrap([$class: 'AnsiColorBuildWrapper', 'colorMapName': 'xterm']) {
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
        }

        stage('Archive Artifacts') {
            steps {
                wrap([$class: 'AnsiColorBuildWrapper', 'colorMapName': 'xterm']) {
                    echo 'Archiving build artifacts...'
                    archiveArtifacts artifacts: '**/dist/**', fingerprint: true
                }
            }
        }

    }

    post {
        always {
            wrap([$class: 'AnsiColorBuildWrapper', 'colorMapName': 'xterm']) {
                echo 'Cleaning up Docker containers...'
                bat """
                docker stop monitoring 2>NUL || echo No container to stop
                docker rm monitoring 2>NUL || echo No container to remove
                """
            }
        }

        success {
            wrap([$class: 'AnsiColorBuildWrapper', 'colorMapName': 'xterm']) {
                echo 'Pipeline Succeeded! 🎉'
                // slackSend(channel: '#moodify', message: 'Pipeline Successful ✅') // optional
            }
        }

        failure {
            wrap([$class: 'AnsiColorBuildWrapper', 'colorMapName': 'xterm']) {
                echo 'Pipeline Failed ❌'
                // slackSend(channel: '#moodify', message: 'Pipeline Failed ❌') // optional
            }
        }
    }
}
