pipeline {
    agent any

    tools {
        nodejs 'node' // Make sure NodeJS is installed in Jenkins Tools
        // sonar-scanner tool is optional if installed via Jenkins Global Tool Configuration
        // sonarQubeScanner 'SonarQubeScanner' // Removed because Declarative pipelines don't support it directly here
    }

    environment {
    SONAR_TOKEN = credentials('SONAR_AUTH_TOKEN') // this ID must exist
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

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    // Run sonar-scanner installed on the Jenkins machine
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
        }

        stage('Docker Build') {
            steps {
                bat 'docker build -t moodify-app .'
            }
        }

        stage('Docker Run') {
            steps {
                bat 'docker run -d -p 3000:3000 moodify-app'
            }
        }
    }
}
