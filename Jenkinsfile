pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = "rusheeth"  // DockerHub username
        BACKEND_IMAGE = "devops-backend"
        FRONTEND_IMAGE = "devops-frontend"
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/Rusheeth/Devops.git'
            }
        }

        stage('Backend Setup & Tests') {
            steps {
                dir('backend') {
                    sh '''
                        . venv/bin/activate
                         pip install pbr bandit
                         bandit -r . -c .bandit || true
                    '''
                }
            }
        }

        stage('Frontend Setup & Tests') {
            steps {
                dir('frontend') {
                    sh '''
                        npm install
                        npm run build
                        npm install --save-dev eslint jest
                        npx eslint . || true
                        npx jest --ci --runInBand || true
                    '''
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    sh "docker build -t rusheeth/simple-notes-app-backend:latest -f backend.Dockerfile ."
                    sh "docker build -t rusheeth/simple-notes-app-frontend:latest -f frontend.Dockerfile ."
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'docker-hub-creds', usernameVariable: 'USER', passwordVariable: 'PASS')]) {
                    sh '''
                        echo $PASS | docker login -u $USER --password-stdin
                        docker push $DOCKER_REGISTRY/$BACKEND_IMAGE:latest
                        docker push $DOCKER_REGISTRY/$FRONTEND_IMAGE:latest
                    '''
                }
            }
        }
    }

    post {
        always {
            echo "Cleaning up workspace and Docker dangling images..."
            sh 'docker system prune -f || true'
            deleteDir()
        }
        success {
            echo "✅ Build and push successful!"
        }
        failure {
            echo "❌ Build failed! Check logs."
        }
    }
}



