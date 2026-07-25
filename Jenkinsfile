/**
 * Jenkins Pipeline — Deploy Vehicle Stock Platform
 *
 * MANUAL TRIGGER. After CI passes (GitHub Actions pushes image to GHCR),
 * you manually run this job in Jenkins with the desired IMAGE_TAG.
 *
 * Parameters:
 *   IMAGE_TAG  — Docker image tag to deploy (default: "latest")
 *                Use the short SHA from GitHub Actions build, e.g. "abc1234"
 *
 * Prerequisites on Jenkins server:
 *   - Docker + docker compose installed
 *   - GitHub PAT with read:packages scope stored as Jenkins credential (used by SCM + GHCR login)
 *   - Environment file at /etc/vehicle-stock/.env.production (managed by Jenkins)
 */

pipeline {
    agent any

    parameters {
        string(
            name: 'IMAGE_TAG',
            defaultValue: 'latest',
            description: 'Docker image tag from GHCR (short SHA or "latest")'
        )
    }

    environment {
        GITHUB_REPO = 'tamaputra23/arista-vsi'           // CHANGE: your GitHub repo
        GHCR_REGISTRY = 'ghcr.io'
        PREVIOUS_IMAGE_TAG = ''
        COMPOSE_PROJECT_NAME = 'arista-vsi'
        HOME_DIR = "${WORKSPACE}"
    }

    stages {

        // Note: docker-compose.prod.yml is checked out from repo into the workspace.
        // Using ${WORKSPACE} path works regardless of container mounts.

        stage('GHCR Login') {
            steps {
                // Uses the SAME Jenkins credential that SCM checkout uses (named 'github')
                // Replace 'github' below with your actual Jenkins credential ID
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

                    # Tag with a stable name for docker compose
                    docker tag "$IMAGE" "${GHCR_REGISTRY}/${GITHUB_REPO}:deploying"
                '''
            }
        }

        stage('Inject .env') {
            steps {
                // Copies the secret file from Jenkins credential store.
                // The credential ID "arista-vsi" is a Secret file containing .env.production.
                withCredentials([file(credentialsId: 'arista-vsi', variable: 'ENV_FILE')]) {
                    sh '''
                        cp ${ENV_FILE} ${HOME_DIR}/.env
                        chmod 600 ${HOME_DIR}/.env
                        echo "=== .env injected (content hidden) ==="
                    '''
                }
            }
        }

        stage('Database Migration') {
            steps {
                sh 'docker compose -f ${HOME_DIR}/docker-compose.prod.yml run --rm app npx prisma migrate deploy'
            }
        }

        stage('Deploy') {
            steps {
                script {
                    try {
                        PREVIOUS_IMAGE_TAG = sh(
                            script: "docker inspect vehicle-stock-api --format '{{.Config.Image}}' 2>/dev/null || echo 'none'",
                            returnStdout: true
                        ).trim()
                    } catch (e) {
                        PREVIOUS_IMAGE_TAG = 'none'
                    }

                    sh 'docker compose -f ${HOME_DIR}/docker-compose.prod.yml up -d app'
                }
            }
        }

        stage('Health Check') {
            steps {
                script {
                    def healthy = false
                    def retries = 12  // 12 * 5s = 60s max wait
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
                                echo "✅ Health check passed (attempt ${i + 1}/${retries})"
                                break
                            } else {
                                echo "⏳ Health check returned ${response}, retrying... (${i + 1}/${retries})"
                            }
                        } catch (e) {
                            echo "⏳ Health check failed (connection refused), retrying... (${i + 1}/${retries})"
                        }
                    }

                    if (!healthy) {
                        error("❌ Health check FAILED after ${retries} attempts. Rolling back...")
                    }
                }
            }
        }

        stage('Tag Deployed Image') {
            steps {
                sh '''
                    # Tag the deployed image as the new "latest" if it passed health check
                    docker tag "${GHCR_REGISTRY}/${GITHUB_REPO}:${IMAGE_TAG}" "${GHCR_REGISTRY}/${GITHUB_REPO}:deployed-$(date +%Y%m%d-%H%M%S)"
                    echo "✅ Deployment successful — image ${IMAGE_TAG} is now running"
                '''
            }
        }
    }

    post {
        failure {
            script {
                echo "❌ Pipeline failed. Rolling back..."
                if (env.PREVIOUS_IMAGE_TAG && env.PREVIOUS_IMAGE_TAG != 'none') {
                    sh """
                        export IMAGE_TAG=${env.PREVIOUS_IMAGE_TAG}
                        docker compose -f ${HOME_DIR}/docker-compose.prod.yml up -d app db
                        echo "Rolled back to ${env.PREVIOUS_IMAGE_TAG}"
                    """
                } else {
                    echo "No previous image to roll back to."
                }
            }
        }
        cleanup {
            // Clean up the temporary tag
            sh '''
                docker rmi "${GHCR_REGISTRY}/${GITHUB_REPO}:deploying" 2>/dev/null || true
                docker logout "${GHCR_REGISTRY}"
            '''
        }
    }
}
