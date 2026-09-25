pipeline {
    agent any

    tools {
        jdk 'jdk17'
        nodejs 'node16'
    }

    environment {
        APP_NAME = 'amazon-prime'
        DOCKERHUB_REPO = 'agodzo/amazon-prime'
        IMAGE_TAG = 'latest'
        SCANNER_HOME = tool 'sonar-scanner'
    }

    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Git Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/karris12/Prime-Video-Clone-Deployment.git'
            }
        }

        stage('Install NPM Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build Application') {
            steps {
                sh 'CI=false npm run build'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'CI=true npm test -- --watch=false --passWithNoTests'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonar-server') {
                    sh '''$SCANNER_HOME/bin/sonar-scanner \
                        -Dsonar.projectName=amazon-prime \
                        -Dsonar.projectKey=amazon-prime'''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                script {
                    waitForQualityGate abortPipeline: false, credentialsId: 'Sonar-token'
                }
            }
        }

        stage('OWASP Dependency Check') {
            steps {
                script {
                    try {
                        dependencyCheck additionalArguments: '--scan ./ --disableYarnAudit --disableNodeAudit', odcInstallation: 'DP-Check'
                        dependencyCheckPublisher pattern: '**/dependency-check-report.xml'
                    } catch (Exception e) {
                        echo "Dependency-Check skipped: ${e.getMessage()}"
                    }
                }
            }
        }

        stage('Trivy File Scan') {
            steps {
                sh 'trivy fs --security-checks vuln,config . > trivy.txt || true'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh "docker build -t ${DOCKERHUB_REPO}:${IMAGE_TAG} ."
            }
        }

        stage('Tag & Push to DockerHub') {
            steps {
                script {
                    withDockerRegistry(credentialsId: 'docker') {
                        sh "docker push ${DOCKERHUB_REPO}:${IMAGE_TAG}"
                    }
                }
            }
        }

        stage('Docker Scout Image') {
            steps {
                script {
                    try {
                        withDockerRegistry(credentialsId: 'docker', toolName: 'docker') {
                            sh "docker-scout quickview ${DOCKERHUB_REPO}:${IMAGE_TAG}"
                            sh "docker-scout cves ${DOCKERHUB_REPO}:${IMAGE_TAG}"
                            sh "docker-scout recommendations ${DOCKERHUB_REPO}:${IMAGE_TAG}"
                        }
                    } catch (Exception e) {
                        echo "Docker Scout skipped: ${e.getMessage()}"
                    }
                }
            }
        }

        stage('Deploy to Container') {
            steps {
                sh "docker rm -f ${APP_NAME} || true"
                sh "docker run -d --name ${APP_NAME} -p 3000:3000 ${DOCKERHUB_REPO}:${IMAGE_TAG}"
            }
        }
    }

    post {
        always {
            emailext attachLog: true,
                subject: "'${currentBuild.result}'",
                body: """
                    <html>
                    <body>
                        <div style="background-color: #FFA07A; padding: 10px; margin-bottom: 10px;">
                            <p style="color: white; font-weight: bold;">Project: ${env.JOB_NAME}</p>
                        </div>
                        <div style="background-color: #90EE90; padding: 10px; margin-bottom: 10px;">
                            <p style="color: white; font-weight: bold;">Build Number: ${env.BUILD_NUMBER}</p>
                        </div>
                        <div style="background-color: #87CEEB; padding: 10px; margin-bottom: 10px;">
                            <p style="color: white; font-weight: bold;">URL: ${env.BUILD_URL}</p>
                        </div>
                    </body>
                    </html>
                """,
                to: 'rooseveltaws@gmail.com',
                mimeType: 'text/html',
                attachmentsPattern: 'trivy.txt'
        }
    }
}
