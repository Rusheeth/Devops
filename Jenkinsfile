pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = "rusheeth"
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
                    script {
                        docker.image('python:3.11').inside {
                            sh '''
                                python -m venv venv
                                . venv/bin/activate
                                pip install --upgrade pip
                                pip install -r requirements.txt
                                pip install pytest bandit
                                pytest --maxfail=1 --disable-warnings -q || true
                                bandit -r . -c .bandit || true
                            '''
                        }
                    }
                }
            }
        }

        stage('Frontend Setup & Tests') {
            steps {
                dir('frontend') {
                    script {
                        docker.image('node:20').inside {
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
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    sh "docker build -t $DOCKER_REGISTRY/$BACKEND_IMAGE:latest -f backend.Dockerfile ./backend"
                    sh "docker build -t $DOCKER_REGISTRY/$FRONTEND_IMAGE:latest -f frontend.Dockerfile ./frontend"
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
