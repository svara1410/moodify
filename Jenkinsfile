pipeline {
    agent any

    tools {
        nodejs 'node'
    }

    environment {
        SONAR_TOKEN = credentials('SONAR_TOKEN')
        DOCKER_CREDS = credentials('dockerhub-creds')   // DockerHub credentials ID
        IMAGE_NAME = "svara1410/moodify-app"
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
                bat 'npm test -- --coverage --watchAll=false'
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
                bat 'docker build -t moodify-app .'
            }
        }

        stage('Docker Tag') {
            steps {
                bat 'docker tag moodify-app %IMAGE_NAME%:latest'
            }
        }

        stage('Docker Login') {
            steps {
                bat """
                echo %DOCKER_CREDS_PSW% | docker login -u %DOCKER_CREDS_USR% --password-stdin
                """
            }
        }

        stage('Docker Push') {
            steps {
                bat 'docker push %IMAGE_NAME%:latest'
            }
        }

        stage('Run Container') {
            steps {
                bat """
                docker stop moodify || echo No container to stop
                docker rm moodify || echo No container to remove
                docker run -d -p 3000:3000 --name moodify %IMAGE_NAME%:latest
                """
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline completed successfully"
        }
        failure {
            echo "❌ Pipeline failed"
        }
    }
}
