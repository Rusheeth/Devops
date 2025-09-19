pipeline {
    agent any

    environment {
        // --- AWS + ECR Configuration ---
        AWS_REGION       = "us-east-1"
        AWS_ACCOUNT_ID   = "559050243300"
        DOCKER_REGISTRY  = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

        FRONTEND_IMAGE   = "my-app-frontend"
        BACKEND_IMAGE    = "my-app-backend"

        // Use short commit hash for tagging
        IMAGE_TAG = "${GIT_COMMIT[0..7]}"
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
                // Authenticate to ECR
                sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${DOCKER_REGISTRY}"

                // Tag & Push images
                sh "docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:${IMAGE_TAG}"
                sh "docker tag ${BACKEND_IMAGE}:${IMAGE_TAG} ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:${IMAGE_TAG}"

                sh "docker push ${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:${IMAGE_TAG}"
                sh "docker push ${DOCKER_REGISTRY}/${BACKEND_IMAGE}:${IMAGE_TAG}"
            }
        }

        stage('Deploy to EKS') {
            steps {
                script {
                    echo "🚀 Deploying application to the cluster..."

                    // Update kubeconfig
                    sh "aws eks update-kubeconfig --region ${AWS_REGION} --name my-eks-cluster"

                    // Replace image references in manifest
                    sh "sed -i 's|rusheeth/devops-frontend:latest|${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:${IMAGE_TAG}|g' deployment.yaml"
                    sh "sed -i 's|rusheeth/devops-backend:latest|${DOCKER_REGISTRY}/${BACKEND_IMAGE}:${IMAGE_TAG}|g' deployment.yaml"

                    // Apply to cluster
                    sh "kubectl apply -f deployment.yaml"

                    // (Optional) force update deployments with new images
                    sh "kubectl set image deployment/frontend-deployment frontend=${DOCKER_REGISTRY}/${FRONTEND_IMAGE}:${IMAGE_TAG} || true"
                    sh "kubectl set image deployment/backend-deployment backend=${DOCKER_REGISTRY}/${BACKEND_IMAGE}:${IMAGE_TAG} || true"
                }
            }
        }
    }

    post {
        always {
            echo "🧹 Cleaning up workspace and Docker dangling images..."
            cleanWs()
            sh 'docker system prune -f || true'
        }
        success {
            echo "✅ Pipeline finished successfully!"
        }
        failure {
            echo "❌ Pipeline failed! Check logs."
        }
    }
}
