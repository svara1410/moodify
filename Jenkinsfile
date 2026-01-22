pipeline {
    agent any

    stages {
        stage('Fetch Project from Git') {
            steps {
                git 'https://github.com/svara1410/moodify.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build Project') {
            steps {
                sh 'npm run build'
            }
        }
    }
}
