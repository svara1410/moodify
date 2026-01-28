pipeline {
    agent any

    tools {
        nodejs 'node'
    }

    environment {
        SONAR_HOME = tool 'SonarQubeScanner'
    }

    stages {

        stage('Checkout') {
            steps {
                git 'https://github.com/svara1410/moodify.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('SonarQube Analysis') {
    steps {
        withSonarQubeEnv('SonarQube') {
            bat '''
            docker run --rm ^
              -e SONAR_HOST_URL=http://host.docker.internal:9000 ^
              -e SONAR_LOGIN=%SONAR_AUTH_TOKEN% ^
              -v "%cd%:/usr/src" ^
              sonarsource/sonar-scanner-cli
            '''
        }
    }
}


        stage('Docker Build') {
            steps {
                sh 'docker build -t moodify-app .'
            }
        }

        stage('Docker Run') {
            steps {
                sh 'docker run -d -p 3000:3000 moodify-app'
            }
        }
    }
}
