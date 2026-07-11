def remote = [:]
remote.name = 'tj-ubuntu-server'
remote.host = 'host.docker.internal'
remote.allowAnyHosts = true

pipeline {
    agent any
    environment {
        SSH_CREDS = credentials("build-server-ssh-user")
    }
    stages {
        stage("Setup") {
            steps {
                script {
                    remote.user = SSH_CREDS_USR
                    remote.password = SSH_CREDS_PSW
                }
            }
        }
        stage('Migrate') {
            agent {
                docker {
                    image 'liquibase/liquibase'
                    args '--entrypoint= -u 0 --network=kareoke_prod'
                    reuseNode true
                }
            }
            environment {
                DATABASE_CREDS = credentials('kareoke-db-creds')
                DATABASE_URL = "postgres_db"
                DATABASE_PORT = "5432"
                DATABASE_SCHEMA = "kareoke"
            }
            steps {
                git(
                    credentialsId: "tj-github",
                    branch: "main",
                    url: "git@github.com:tbiegner99/Kareoke.git"
                )
                script {
                    dir("database/kareoke") {
                        sh "pwd"
                        sh "ls"
                        sh "ls changelogs"
                        sh "curl -sSL -o postgresql.jar https://jdbc.postgresql.org/download/postgresql-42.7.4.jar"
                        sh "/liquibase/liquibase update --classpath=postgresql.jar --username=$DATABASE_CREDS_USR --password=$DATABASE_CREDS_PSW --url=jdbc:postgresql://$DATABASE_URL:$DATABASE_PORT/$DATABASE_SCHEMA --changelogFile=changelog-root.xml"
                    }
                }
            }
        }
        stage('Deploy') {
            agent {
                docker "alpine:3"
            }
            steps {
                git(
                    credentialsId: "tj-github",
                    branch: "main",
                    url: "git@github.com:tbiegner99/Kareoke.git"
                )
                sshPublisher(publishers: [
                    sshPublisherDesc(
                        configName: 'tj-ubuntu-server',
                        transfers: [
                            sshTransfer(
                                cleanRemote: false,
                                excludes: '**/node_modules/**, **/.git/**',
                                execCommand: '',
                                execTimeout: 120000,
                                flatten: false,
                                makeEmptyDirs: true,
                                noDefaultExcludes: false,
                                patternSeparator: '[, ]+',
                                remoteDirectory: 'vms/kareoke',
                                remoteDirectorySDF: false,
                                removePrefix: '',
                                sourceFiles: 'backend/**/*, ui/**/*, production/**/*, database/**/*'
                            )
                        ],
                        usePromotionTimestamp: false,
                        useWorkspaceInPromotion: false,
                        verbose: true
                    )
                ])
                sshCommand(
                    remote: remote,
                    command: 'cd /mnt/media/vms/kareoke && docker compose -f production/docker-compose.yml up -d --build'
                )
                echo "DEPLOY Complete..."
            }
        }
    }
    post {
        always {
            cleanWs()
        }
    }
}
