pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = "docker.io"
        FRONTEND_IMAGE  = "rusheeth/devops-frontend"
        BACKEND_IMAGE   = "rusheeth/devops-backend"
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

        stage('Backend Setup & Tests') {
            steps {
                dir('backend') {
                    sh '''
                        docker run --rm -v ${WORKSPACE}/backend:/app -w /app python:3.11 bash -c "
                            pip install --upgrade pip &&
                            pip install -r requirements.txt &&
                            pip install pytest bandit &&
                            pytest --maxfail=1 --disable-warnings -q &&
                            bandit -r . -c .bandit
                        "
                    '''
                }
            }
        }

        stage('Frontend Setup & Tests') {
            steps {
                dir('frontend') {
                    sh '''
                        docker run --rm -v ${WORKSPACE}/frontend:/app -w /app node:20 bash -c "
                            npm install &&
                            npm run build &&
                            npm install --save-dev eslint jest &&
                            npx eslint . &&
                            npx jest --ci --runInBand
                        "
                    '''
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh "docker build -t ${FRONTEND_IMAGE}:latest -f frontend/Dockerfile frontend"
                sh "docker build -t ${BACKEND_IMAGE}:latest -f backend/Dockerfile backend"
            }
        }

        stage('Push Docker Images') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub-creds', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh '''
                        echo $PASS | docker login -u $USER --password-stdin
                        docker push $FRONTEND_IMAGE:latest
                        docker push $BACKEND_IMAGE:latest
                    '''
                }
            }
        }
    }

    post {
        always {
            echo "Cleaning up workspace and Docker dangling images..."
            cleanWs()
            sh 'docker system prune -f || true'
        }
        success {
            echo "✅ Build and push successful!"
        }
        failure {
            echo "❌ Build failed! Check logs."
        }
    }
}
