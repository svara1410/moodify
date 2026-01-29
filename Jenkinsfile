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
                      -Dsonar.token=%SONAR_TOKEN%
                    """
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

                bat '''
                docker stop moodify-container || exit 0
                docker rm moodify-container || exit 0
                '''

                bat 'docker run -d -p 3000:3000 --name moodify-container moodify-app'
            }
        }

        stage('Monitoring & Metrics Validation') {
    steps {
        echo 'Validating monitoring stack...'

        // Wait for app to start (max 30 seconds)
        script {
            def maxRetries = 6
            def retryCount = 0
            def appUp = false

            while (retryCount < maxRetries && !appUp) {
                try {
                    echo "Checking application health (attempt ${retryCount + 1})..."
                    bat 'curl http://localhost:3000 -f'  // -f fails on HTTP errors
                    appUp = true
                    echo "✅ Application is up!"
                } catch (Exception e) {
                    retryCount++
                    if (retryCount < maxRetries) {
                        echo "App not ready yet, waiting 5 seconds..."
                        bat 'timeout /t 5 >nul'
                    } else {
                        error "❌ Application did not start in time!"
                    }
                }
            }
        }

        // Check Prometheus
        echo 'Checking Prometheus...'
        bat 'curl http://localhost:9090/-/healthy -f || exit 1'

        // Check Grafana
        echo 'Checking Grafana...'
        bat 'curl http://localhost:3001/api/health -f || exit 1'
    }
}
 // <-- This closes the stages block

    post {
        success {
            echo '✅ CI/CD + Monitoring Pipeline SUCCESSFUL'
        }
        failure {
            echo '❌ Pipeline failed'
        }
    }
}
