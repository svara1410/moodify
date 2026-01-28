pipeline {
    agent any

    environment {
        IMAGE_NAME = "moodify-app"
    }

    stages {

        stage('Clone Code') {
            steps {
                git 'https://github.com/svara1410/moodify.git'
            }
        }

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
                sh 'docker build -t $IMAGE_NAME .'
            }
        }

        stage('Trivy Scan') {
            steps {
                sh 'trivy image $IMAGE_NAME || true'
            }
        }

        stage('Run Container') {
            steps {
                sh '''
                docker rm -f moodify || true
                docker run -d -p 3000:3000 --name moodify $IMAGE_NAME
                '''
            }
        }
    }
}
