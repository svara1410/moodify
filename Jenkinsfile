pipeline {
    agent any

    tools {
        nodejs 'node' // Make sure NodeJS is installed in Jenkins Tools
        // sonar-scanner tool is optional if installed via Jenkins Global Tool Configuration
        // sonarQubeScanner 'SonarQubeScanner' // Removed because Declarative pipelines don't support it directly here
    }

    environment {
        SONAR_TOKEN = credentials('SONAR_TOKEN') // this ID must exist
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
                    withCredentials([string(credentialsId: 'SONAR_TOKEN', variable: 'SONAR_TOKEN')]) {
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
                bat '''
                docker stop moodify-container || exit 0
                docker rm moodify-container || exit 0
                docker run -d --name moodify-container -p 3000:3000 moodify-app
                '''
            }
        }

        // =========================
        // Prometheus Monitoring Stage
        // =========================
        stage('Record Jenkins Metrics') {
            steps {
                echo 'Recording build metrics to Prometheus'
                // Increment a Jenkins counter metric exposed to Prometheus
                prometheus {
                    incrementJobCounter(name: 'moodify_build_total')
                }
            }
        }

    }
}
