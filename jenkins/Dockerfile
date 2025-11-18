FROM jenkins/jenkins:lts
USER root

# ========================
# PHP + Composer + NodeJS
# ========================
RUN apt-get update && apt-get install -y \
    php php-cli php-mbstring php-xml php-curl php-zip php-mysql \
    unzip curl wget gnupg build-essential python3 python3-pip \
    apt-transport-https ca-certificates lsb-release nano iputils-ping netcat-openbsd

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs

# ========================
# Docker CLI
# ========================
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor -o /usr/share/keyrings/docker.gpg && \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker.gpg] \
    https://download.docker.com/linux/debian $(lsb_release -cs) stable" \
    > /etc/apt/sources.list.d/docker.list && \
    apt-get update && apt-get install -y docker-ce-cli

# ========================
# Sonar Scanner
# ========================
RUN wget -O /tmp/sonar.zip \
    https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-6.2.1.4610-linux-x64.zip && \
    unzip -q /tmp/sonar.zip -d /opt/sonar-scanner && \
    mv /opt/sonar-scanner/sonar-scanner-* /opt/sonar-scanner/latest && \
    ln -s /opt/sonar-scanner/latest/bin/sonar-scanner /usr/local/bin/sonar-scanner && \
    rm /tmp/sonar.zip

# ========================
# Trivy
# ========================
RUN wget https://github.com/aquasecurity/trivy/releases/latest/download/trivy_0.50.1_Linux-64bit.deb && \
    dpkg -i trivy_0.50.1_Linux-64bit.deb && rm trivy_0.50.1_Linux-64bit.deb

# ========================
# Gitleaks
# ========================
RUN wget https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks_8.18.4_linux_x64.tar.gz && \
    tar -xvf gitleaks_8.18.4_linux_x64.tar.gz && mv gitleaks /usr/local/bin/ && rm gitleaks_8.18.4_linux_x64.tar.gz

# ========================
# Semgrep
# ========================
RUN pip install semgrep

# ========================
# kubectl + Helm + Liquibase
# ========================
RUN curl -LO "https://dl.k8s.io/release/$(curl -Ls https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && \
    install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl && rm kubectl

RUN curl https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3 | bash

RUN wget https://github.com/liquibase/liquibase/releases/download/v5.0.1/liquibase-5.0.1.zip -O /tmp/liquibase.zip && \
    unzip -q /tmp/liquibase.zip -d /opt/liquibase && \
    ln -s /opt/liquibase/liquibase /usr/local/bin/liquibase && rm /tmp/liquibase.zip

USER jenkins
