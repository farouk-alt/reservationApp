FROM jenkins/jenkins:lts

USER root

# ========================
# Install PHP + Composer + NodeJS
# ===========================
RUN apt-get update && apt-get install -y \
    php php-cli php-mbstring php-xml php-curl php-zip php-mysql \
    unzip curl wget gnupg build-essential apt-transport-https ca-certificates lsb-release \
    nano iputils-ping netcat-openbsd

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- \
    --install-dir=/usr/local/bin --filename=composer

# Install NodeJS 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# ===========================
# Install Docker CLI
# ===========================
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor \
    -o /usr/share/keyrings/docker.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker.gpg] \
    https://download.docker.com/linux/debian $(lsb_release -cs) stable" \
    > /etc/apt/sources.list.d/docker.list && \
    apt-get update && apt-get install -y docker-ce-cli

# ===========================
# Install SonarScanner (via direct download with retries)
# ===========================
RUN mkdir -p /opt/sonar-scanner && \
    for i in 1 2 3; do \
        wget --timeout=30 --tries=3 \
        https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-6.2.1.4610-linux-x64.zip \
        -O /tmp/sonar.zip && break || sleep 5; \
    done && \
    unzip -q /tmp/sonar.zip -d /opt/sonar-scanner && \
    mv /opt/sonar-scanner/sonar-scanner-* /opt/sonar-scanner/latest && \
    ln -s /opt/sonar-scanner/latest/bin/sonar-scanner /usr/local/bin/sonar-scanner && \
    chmod +x /usr/local/bin/sonar-scanner && \
    rm /tmp/sonar.zip

# ===========================
# Install kubectl
# ===========================
RUN curl -LO "https://dl.k8s.io/release/$(curl -Ls https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && \
    install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl && \
    rm kubectl

# Install Helm
RUN apt-get update && apt-get install -y curl && \
    curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash


# ===========================
# Install Liquibase
# ===========================
RUN wget https://github.com/liquibase/liquibase/releases/download/v5.0.1/liquibase-5.0.1.zip -O /tmp/liquibase.zip && \
    unzip -q /tmp/liquibase.zip -d /opt/liquibase && \
    ln -s /opt/liquibase/liquibase /usr/local/bin/liquibase && \
    rm /tmp/liquibase.zip

# Install MySQL JDBC driver for Liquibase
RUN curl -L https://dev.mysql.com/get/Downloads/Connector-J/mysql-connector-j-8.0.33.tar.gz | tar xz && \
    cp mysql-connector-j-8.0.33/mysql-connector-j-8.0.33.jar /usr/lib/ && \
    rm -rf mysql-connector-j-8.0.33

# ===========================
# Install Jenkins Plugins
# ===========================
RUN jenkins-plugin-cli --plugins \
    workflow-aggregator \
    git \
    docker-workflow \
    pipeline-stage-view \
    credentials-binding \
    ws-cleanup \
    sonar


# Clean up
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

USER jenkins