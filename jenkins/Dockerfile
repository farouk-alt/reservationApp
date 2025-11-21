FROM jenkins/jenkins:lts
USER root

# ===============
# PHP + Composer + NodeJS
# ===============
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

    
# ===== PHP 8.4 + SQLite + Xdebug (WORKING) =====
# ===== PHP 8.4 + SQLite + Xdebug =====
RUN apt-get update && apt-get install -y \
    php8.4-cli php8.4-dev php8.4-sqlite3 php8.4-mbstring php8.4-xml php8.4-curl php8.4-zip \
    autoconf gcc make pkg-config \
    && pecl install xdebug \
    && echo "zend_extension=$(php-config --extension-dir)/xdebug.so" > /etc/php/8.4/cli/conf.d/20-xdebug.ini \
    && echo "xdebug.mode=coverage" >> /etc/php/8.4/cli/conf.d/20-xdebug.ini \
    && echo "extension=pdo_sqlite" > /etc/php/8.4/cli/conf.d/10-sqlite.ini \
    && echo "extension=sqlite3" >> /etc/php/8.4/cli/conf.d/10-sqlite.ini





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
# Trivy (Official APT Repository - Always Works)
# ========================
# === Vulnerability Scanner (GRYPE - stable) ===
RUN curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | \
    sh -s -- -b /usr/local/bin




# ========================
# Gitleaks
# ========================
RUN wget -q https://github.com/gitleaks/gitleaks/releases/download/v8.21.2/gitleaks_8.21.2_linux_x64.tar.gz && \
    tar -xzf gitleaks_8.21.2_linux_x64.tar.gz && \
    mv gitleaks /usr/local/bin/ && \
    chmod +x /usr/local/bin/gitleaks && \
    rm gitleaks_8.21.2_linux_x64.tar.gz

# ========================
# Semgrep (Safe pipx install)
# ========================
RUN apt-get update && apt-get install -y pipx && \
    pipx ensurepath && \
    pipx install semgrep
ENV PATH="$PATH:/root/.local/bin"



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
