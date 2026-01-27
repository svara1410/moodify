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
        bat 'npm install'
      }
    }

    stage('SonarQube Analysis') {
      environment {
        SONAR_TOKEN = credentials('sqa_a7e75fe218ad898df8006b6796d443050f7c4809')
      }
      steps {
        withSonarQubeEnv('Moodify') {
          bat """
          npx sonar-scanner ^
            -Dsonar.projectKey=moodify ^
            -Dsonar.sources=. ^
            -Dsonar.login=%SONAR_TOKEN%
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
