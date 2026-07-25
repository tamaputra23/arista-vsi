/**
 * Jenkins Pipeline — Deploy Vehicle Stock Platform
 *
 * MANUAL TRIGGER. After CI passes (GitHub Actions pushes image to GHCR),
 * you manually run this job in Jenkins with the desired IMAGE_TAG.
 *
 * Parameters:
 *   IMAGE_TAG  — Docker image tag to deploy (default: "latest")
 *
 * Prerequisites on Jenkins server:
 *   - Docker + docker compose installed
 *   - GitHub PAT with repo + read:packages scopes, stored as Jenkins credential "github"
 *   - Server directory /home/tama/arista with docker-compose.prod.yml
 */

pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
        timestamps()
        skipDefaultCheckout(true)
    }

    parameters {
        string(
            name: 'IMAGE_TAG',
            defaultValue: 'latest',
            description: 'Docker image tag from GHCR (short SHA or "latest")'
        )
    }

    environment {
        GITHUB_REPO = 'tamaputra23/arista-vsi'
        GHCR_REGISTRY = 'ghcr.io'
        PREVIOUS_IMAGE_TAG = ''
        COMPOSE_PROJECT_NAME = 'arista-vsi'
        ARISTA_DIR = '/home/tama/arista'
        BUILD_DIR = "/tmp/build-arista-vsi-${env.BUILD_NUMBER}"
    }

    stages {

        stage('Clone') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'github',
                    usernameVariable: 'GIT_USER',
                    passwordVariable: 'GIT_TOKEN'
                )]) {
                    sh 'git clone --depth 1 https://${GIT_USER}:${GIT_TOKEN}@github.com/${GITHUB_REPO}.git ${BUILD_DIR}'
                }
            }
        }

        stage('GHCR Login') {
            steps {
                withCredentials([string(credentialsId: 'github-ghcr', variable: 'GITHUB_PAT')]) {
                    sh '''
                        echo "$GITHUB_PAT" | docker login ${GHCR_REGISTRY} -u ignored --password-stdin
                    '''
                }
            }
        }

        stage('Pull Image') {
            steps {
                sh '''
                    IMAGE="${GHCR_REGISTRY}/${GITHUB_REPO}:${IMAGE_TAG}"
                    echo "Pulling $IMAGE ..."
                    docker pull "$IMAGE"
                    docker tag "$IMAGE" "${GHCR_REGISTRY}/${GITHUB_REPO}:deploying"
                '''
            }
        }

        stage('Database Migration') {
            steps {
                sh '''
                    echo "Running Prisma migrations..."
                    docker compose -f ${ARISTA_DIR}/docker-compose.prod.yml run --rm \
                        -e IMAGE_TAG=${IMAGE_TAG} \
                        app npx prisma migrate deploy
                '''
            }
        }

        stage('Deploy') {
            steps {
                script {
                    // Capture previous image tag for rollback
                    try {
                        PREVIOUS_IMAGE_TAG = sh(
                            script: "docker inspect vehicle-stock-api --format '{{.Config.Image}}' 2>/dev/null || echo 'none'",
                            returnStdout: true
                        ).trim()
                    } catch (e) {
                        PREVIOUS_IMAGE_TAG = 'none'
                    }

                    sh '''
                        export IMAGE_TAG=${IMAGE_TAG}
                        docker compose -f ${ARISTA_DIR}/docker-compose.prod.yml up -d app db
                    '''
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    def healthy = false
                    def retries = 12
                    def port = env.APP_PORT ?: '6300'

                    for (int i = 0; i < retries; i++) {
                        sleep 5
                        try {
                            def response = sh(
                                script: "curl -s -o /dev/null -w '%{http_code}' http://localhost:${port}/health",
                                returnStdout: true
                            ).trim()
                            if (response == '200') {
                                healthy = true
                                echo "Health check passed (attempt ${i + 1}/${retries})"
                                break
                            } else {
                                echo "Health check returned ${response}, retrying... (${i + 1}/${retries})"
                            }
                        } catch (e) {
                            echo "Health check failed (connection refused), retrying... (${i + 1}/${retries})"
                        }
                    }

                    if (!healthy) {
                        error("Health check FAILED after ${retries} attempts. Rolling back...")
                    }
                }
            }
        }
    }

    post {
        always {
            sh 'rm -rf ${BUILD_DIR} || true'
        }
        success {
            echo "Deployment successful — image ${IMAGE_TAG} is now running"
        }
        failure {
            script {
                echo "Deployment FAILED. Rolling back..."
                if (env.PREVIOUS_IMAGE_TAG && env.PREVIOUS_IMAGE_TAG != 'none') {
                    sh """
                        export IMAGE_TAG=${env.PREVIOUS_IMAGE_TAG}
                        docker compose -f ${ARISTA_DIR}/docker-compose.prod.yml up -d app db
                        echo "Rolled back to ${env.PREVIOUS_IMAGE_TAG}"
                    """
                } else {
                    echo "No previous image to roll back to."
                }
            }
        }
        cleanup {
            sh '''
                docker rmi "${GHCR_REGISTRY}/${GITHUB_REPO}:deploying" 2>/dev/null || true
                docker logout "${GHCR_REGISTRY}"
            '''
        }
    }
}
