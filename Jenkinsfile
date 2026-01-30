pipeline {
    agent any

    tools {
        nodejs 'node'
    }

    environment {
        SONAR_TOKEN = credentials('SONAR_TOKEN')
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
                echo 'Running frontend tests...'
                bat 'npm test -- --coverage --watchAll=false'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    withCredentials([
                        string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN')
                    ]) {
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

        /* ========= DOCKER (MINIMAL CHANGES) ========= */

        stage('Docker Build') {
            steps {
                bat 'docker build -t svara1410/moodify-app:latest .'
            }
        }

        stage('Docker Push') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'DOCKERHUB',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    bat """
                    docker login -u %DOCKER_USER% -p %DOCKER_PASS%
                    docker push svara1410/moodify-app:latest
                    """
                }
            }
        }

        stage('Monitoring') {
            steps {
                bat """
                docker stop monitoring 2>NUL || echo No container to stop
                docker rm monitoring 2>NUL || echo No container to remove
                docker run -d --name monitoring -p 3000:3000 svara1410/moodify-app:latest
                """

                script {
                    def healthy = false

                    for (int i = 1; i <= 6; i++) {
                        echo "Health check attempt ${i}..."
                        def status = bat(
                            script: "curl -s http://localhost:3000 > nul",
                            returnStatus: true
                        )
                        if (status == 0) {
                            echo "✅ App is UP"
                            healthy = true
                            break
                        }
                        sleep 5
                    }

                    if (!healthy) {
                        bat 'docker logs monitoring'
                        error "❌ Health check failed"
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Build finished – container preserved'
        }
    }
}
