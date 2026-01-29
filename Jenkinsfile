pipeline {
    agent any

    environment {
        SONAR_TOKEN = credentials('sonar-token') // your SonarQube token ID
    }

    stages {

        stage('Checkout SCM') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                tool name: 'NodeJS', type: 'NodeJSInstallation' // adjust if your NodeJS tool name is different
                bat 'npm install'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('SonarQube') { // name of your SonarQube server in Jenkins
                    bat 'sonar-scanner'
                }
            }
        }

        stage('Docker Build') {
            steps {
                script {
                    // Build Docker image
                    bat 'docker build -t moodify-app .'
                }
            }
        }

        stage('Docker Run') {
            steps {
                script {
                    // Stop container if exists
                    bat 'docker stop moodify-container || exit 0'

                    // Run container
                    bat 'docker run -d --name moodify-container -p 3000:3000 moodify-app'
                }
            }
        }

        stage('Record Jenkins Metrics') {
            steps {
                echo 'Recording build metrics to Prometheus skipped (plugin not installed).'
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished!'
        }
    }
}
