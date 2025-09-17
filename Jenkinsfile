pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = "docker.io"
        FRONTEND_IMAGE  = "rusheeth/devops-frontend"
        BACKEND_IMAGE   = "rusheeth/devops-backend"
        SONAR_AUTH_TOKEN = credentials('sonar-token')   // 🔹 Your SonarQube token stored in Jenkins credentials
    }

    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/Rusheeth/Devops.git'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonar-server') {  // 🔹 Uses SonarQube server configured in Jenkins
                    script {
                        def scannerHome = tool 'sonar-scanner'  // 🔹 Jenkins Global Tool name

                        // Backend scan
                        sh """
                            ${scannerHome}/bin/sonar-scanner \
                              -Dsonar.projectKey=backend \
                              -Dsonar.sources=backend \
                              -Dsonar.host.url=${SONAR_HOST_URL} \
                              -Dsonar.login=${SONAR_AUTH_TOKEN}
                        """

                        // Frontend scan
                        sh """
                            ${scannerHome}/bin/sonar-scanner \
                              -Dsonar.projectKey=frontend \
                              -Dsonar.sources=frontend \
                              -Dsonar.host.url=${SONAR_HOST_URL} \
                              -Dsonar.login=${SONAR_AUTH_TOKEN}
                        """
                    }
                }
            }
        }

        stage("SonarQube Quality Gate") {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Backend Setup & Tests') {
            steps {
                dir('backend') {
                    sh 'pip install -r requirements.txt'
                    sh 'pytest'
                }
            }
        }

        stage('Frontend Setup & Tests') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm test -- --watchAll=false'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    sh "docker build -t ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:latest ./frontend"
                    sh "docker build -t ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:latest ./backend"
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                script {
                    withDockerRegistry([credentialsId: 'dockerhub-credentials', url: '']) {
                        sh "docker push ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:latest"
                        sh "docker push ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:latest"
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Cleaning up workspace and Docker dangling images...'
            cleanWs()
            sh 'docker system prune -f || true'
        }
        success {
            echo '✅ Build and deployment pipeline completed successfully!'
        }
        failure {
            echo '❌ Build failed! Check logs.'
        }
    }
}
