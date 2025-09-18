pipeline {
    agent any
    
    environment {
        // Use an AWS ECR registry for a production pipeline
        DOCKER_REGISTRY = "123456789012.dkr.ecr.us-east-1.amazonaws.com"
    
        FRONTEND_IMAGE  = "my-app-frontend"
        BACKEND_IMAGE  = "my-app-backend"

        // Use a unique tag for each build
        IMAGE_TAG = "${env.GIT_COMMIT}"
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
                withSonarQubeEnv('sonar-server') {
                    script {
                        def scannerHome = tool 'sonar-scanner'
                        sh """
                            ${scannerHome}/bin/sonar-scanner \
                                -Dsonar.projectKey=backend \
                                -Dsonar.sources=backend \
                                -Dsonar.host.url=$SONAR_HOST_URL \
                                -Dsonar.login=$SONAR_AUTH_TOKEN
                            
                            ${scannerHome}/bin/sonar-scanner \
                                -Dsonar.projectKey=frontend \
                                -Dsonar.sources=frontend \
                                -Dsonar.host.url=$SONAR_HOST_URL \
                                -Dsonar.login=$SONAR_AUTH_TOKEN
                        """
                    }
                }
            }
        }

        stage('SonarQube Quality Gate') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh "docker build -t ${FRONTEND_IMAGE}:${IMAGE_TAG} -f frontend/Dockerfile frontend"
                sh "docker build -t ${BACKEND_IMAGE}:${IMAGE_TAG} -f backend/Dockerfile backend"
            }
        }

        stage('Push Docker Images to ECR') {
            steps {
                // Login to ECR using the EC2 instance's IAM role
                sh "aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ${DOCKER_REGISTRY}"
                
                // Tag images for ECR
                sh "docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:${IMAGE_TAG}"
                sh "docker tag ${BACKEND_IMAGE}:${IMAGE_TAG} ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:${IMAGE_TAG}"
                
                // Push images
                sh "docker push ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:${IMAGE_TAG}"
                sh "docker push ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:${IMAGE_TAG}"
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    echo "🚀 Deploying application to the cluster..."
                    
                    // Update kubeconfig using the EC2 instance IAM role
                    sh 'aws eks update-kubeconfig --region us-east-1 --name my-eks-cluster'
                    
                    // Substitute the image tags in the YAML file before deploying
                    sh "sed -i 's|rusheeth/devops-frontend:latest|${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:${IMAGE_TAG}|g' deployment.yaml"
                    sh "sed -i 's|rusheeth/devops-backend:latest|${DOCKER_REGISTRY}/${BACKEND_IMAGE}:${IMAGE_TAG}|g' deployment.yaml"
                    
                    // Apply the updated manifest
                    sh 'kubectl apply -f deployment.yaml'
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



