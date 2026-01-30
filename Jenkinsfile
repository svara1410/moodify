pipeline {
    agent any

    tools {
        nodejs 'node'
    }

    environment {
        SONAR_TOKEN = credentials('SONAR_TOKEN')
        DOCKERHUB = credentials('DOCKERHUB')
        DOCKER_IMAGE = 'svara1410/moodify-app'
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
                bat 'docker build -t %DOCKER_IMAGE% .'
            }
        }

        stage('Docker Login & Push') {
            steps {
                bat """
                docker login -u %DOCKERHUB_USR% -p %DOCKERHUB_PSW%
                docker push %DOCKER_IMAGE%
                """
            }
        }

        stage('Run Container') {
            steps {
                bat """
                docker stop moodify 2>NUL || echo No container
                docker rm moodify 2>NUL || echo No container
                docker run -d --name moodify -p 3000:3000 %DOCKER_IMAGE%
                """
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully'
        }
        failure {
            echo '❌ Pipeline failed'
        }
    }
}
