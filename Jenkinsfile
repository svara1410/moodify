pipeline {
    agent any

    environment {
        IMAGE_NAME = "moodify-app"
    }

    stages {

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    bat '''
                    docker run --rm ^
                      -e SONAR_HOST_URL=%SONAR_HOST_URL% ^
                      -e SONAR_LOGIN=%SONAR_AUTH_TOKEN% ^
                      -v "%CD%:/usr/src" ^
                      sonarsource/sonar-scanner-cli
                    '''
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t %IMAGE_NAME% .'
            }
        }

        stage('Trivy Scan') {
            steps {
                bat 'trivy image %IMAGE_NAME% || exit 0'
            }
        }

        stage('Run Container') {
            steps {
                bat '''
                docker rm -f moodify 2>nul
                docker run -d -p 3000:3000 --name moodify %IMAGE_NAME%
                '''
            }
        }
    }
}
