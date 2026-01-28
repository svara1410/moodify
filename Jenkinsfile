pipeline {
    agent any

    stages {

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh 'sonar-scanner'
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t moodify:latest .'
            }
        }

        stage('Run Docker Container') {
            steps {
                sh '''
                docker stop moodify || true
                docker rm moodify || true
                docker run -d --name moodify -p 3000:3000 moodify:latest
                '''
            }
        }
    }
}
