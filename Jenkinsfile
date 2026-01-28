pipeline {
    agent any

    environment {
        IMAGE_NAME = "moodify-app"
    }

    stages {

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh '''
                    sonar-scanner \
                    -Dsonar.projectKey=moodify \
                    -Dsonar.sources=.
                    '''
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t %IMAGE_NAME% .'
            }
        }

        stage('Trivy Scan') {
            steps {
                sh 'trivy image %IMAGE_NAME% || exit 0'
            }
        }

        stage('Run Container') {
            steps {
                sh '''
                docker rm -f moodify || exit 0
                docker run -d -p 3000:3000 --name moodify %IMAGE_NAME%
                '''
            }
        }
    }
}
