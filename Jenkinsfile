pipeline {
    agent any

    tools {
        nodejs "NodeJS"
        python "Python3"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Rusheeth/Devops.git'
            }
        }

        stage('Setup Backend') {
            steps {
                dir('backend') {
                    sh '''
                        python3 -m venv venv
                        . venv/bin/activate
                        pip install --upgrade pip
                        pip install -r requirements.txt
                    '''
                }
            }
        }

        stage('Setup Frontend') {
            steps {
                dir('frontend') {
                    sh '''
                        npm install
                    '''
                }
            }
        }

        stage('Run Backend Tests') {
            steps {
                dir('backend') {
                    sh '''
                        . venv/bin/activate
                        pytest || true
                    '''
                }
            }
        }

        stage('Run Frontend Tests') {
            steps {
                dir('frontend') {
                    sh '''
                        npx jest --ci --runInBand --passWithNoTests
                    '''
                }
            }
        }

        stage('Security Scan Backend') {
            steps {
                dir('backend') {
                    sh '''
                        . venv/bin/activate
                        pip install pbr bandit
                        bandit -r . || true
                    '''
                }
            }
        }

        stage('Security Scan Frontend') {
            steps {
                dir('frontend') {
                    sh '''
                        npx eslint . || true
                    '''
                }
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                dir('backend') {
                    sh 'docker build -t backend-app .'
                }
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                dir('frontend') {
                    sh 'docker build -t frontend-app .'
                }
            }
        }
    }
}
