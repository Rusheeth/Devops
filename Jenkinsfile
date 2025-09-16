pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = "rusheeth"  // DockerHub username
        FRONTEND_IMAGE = "rusheeth/devops-frontend"
        BACKEND_IMAGE  = "rusheeth/devops-backend"
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
                        # Run inside Python container
                        docker run --rm -v $PWD:/app -w /app python:3.11 bash -c "
                            pip install --upgrade pip &&
                            pip install -r requirements.txt &&
                            pip install pytest bandit &&
                            pytest --maxfail=1 --disable-warnings -q || true &&
                            bandit -r . -c .bandit || true
                        "
                    '''
                }
            }
        }

        stage('Frontend Setup & Tests') {
            steps {
                dir('frontend') {
                    sh '''
                        # Run inside Node container
                        docker run --rm -v $PWD:/app -w /app node:20 bash -c "
                            npm install &&
                            npm run build &&
                            npm install --save-dev eslint jest &&
                            npx eslint . || true &&
                            npx jest --ci --runInBand || true
                        "
                    '''
                }
            }
        }

       stages {
        stage('Build Docker Images') {
            steps {
                script {
                    docker.build("${FRONTEND_IMAGE}:latest", "-f frontend.Dockerfile ./frontend")
                    docker.build("${BACKEND_IMAGE}:latest", "-f backend.Dockerfile ./backend")
                }
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




