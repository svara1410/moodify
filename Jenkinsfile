pipeline {
    agent any

    environment {
        SONAR_TOKEN = credentials('SONAR_TOKEN')
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/svara1410/moodify.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing npm dependencies...'
                bat 'npm install'
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

        stage('Quality Gate') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Docker Build') {
            steps {
                echo 'Building Docker image...'
                bat 'docker build -t moodify-app .'
            }
        }

        stage('Docker Run') {
            steps {
                echo 'Running Docker container...'

                // Stop old container if running
                bat '''
                docker stop moodify-container || exit 0
                docker rm moodify-container || exit 0
                '''

                bat 'docker run -d -p 3000:3000 --name moodify-container moodify-app'
            }
        }

        stage('Monitoring & Metrics Validation') {
            steps {
                echo 'Checking application metrics and monitoring stack...'

                bat '''
                echo ==== APPLICATION METRICS ====
                powershell -Command "Invoke-WebRequest http://localhost:3000/metrics"

                echo ==== PROMETHEUS ====
                echo http://localhost:9090

                echo ==== GRAFANA ====
                echo http://localhost:3001
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline completed successfully with CI + Monitoring!'
        }
        failure {
            echo '❌ Pipeline failed. Check above logs.'
        }
    }
}
