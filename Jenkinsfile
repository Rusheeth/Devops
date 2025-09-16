pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = "rusheeth"
        BACKEND_IMAGE = "simple-notes-app-backend"
        FRONTEND_IMAGE = "simple-notes-app-frontend"
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/Rusheeth/Devops.git'
            }
        }

        stage('Backend Setup & Tests') {
            steps {
                sh '''
                cd backend
                python3 -m venv venv
                source venv/bin/activate
                pip install -r requirements.txt
                pytest || true
                bandit -r . || true
                '''
            }
        }

        stage('Frontend Setup & Tests') {
            steps {
                sh '''
                cd frontend
                npm install
                npm run lint || true
                npm test || true
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                docker build -t $DOCKER_REGISTRY/$BACKEND_IMAGE:latest ./backend
                docker build -t $DOCKER_REGISTRY/$FRONTEND_IMAGE:latest ./frontend
                '''
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
}