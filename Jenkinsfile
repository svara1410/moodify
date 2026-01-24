pipeline {
  agent any

  stages {

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install Dependencies') {
      steps {
        sh 'npm install'
      }
    }

    stage('SonarQube Analysis') {
      environment {
        SONAR_TOKEN = credentials('SONAR_TOKEN_ID') // match your Jenkins credential ID
      }
      steps {
        withSonarQubeEnv('SonarQube') {
          sh """
            # Run sonar scanner
            npx sonar-scanner \
              -Dsonar.projectKey=moodify \
              -Dsonar.sources=. \
              -Dsonar.host.url=$SONAR_HOST_URL \
              -Dsonar.login=$SonarQube token
          """
        }
      }
    }

    stage('Quality Gate') {
      steps {
        waitForQualityGate abortPipeline: true
      }
    }
  }
}
