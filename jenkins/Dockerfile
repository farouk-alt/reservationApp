FROM jenkins/jenkins:lts

USER root

# ===========================
# Install PHP + Composer + NodeJS
# ===========================
RUN apt-get update && apt-get install -y \
    php php-cli php-mbstring php-xml php-curl php-zip php-mysql \
    unzip curl wget gnupg build-essential apt-transport-https ca-certificates lsb-release

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- \
    --install-dir=/usr/local/bin --filename=composer

# Install NodeJS 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# ===========================
# Install Docker CLI inside Jenkins
# ===========================
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | gpg --dearmor \
    -o /usr/share/keyrings/docker.gpg

RUN echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker.gpg] \
  https://download.docker.com/linux/debian $(lsb_release -cs) stable" \
  > /etc/apt/sources.list.d/docker.list

RUN apt-get update && apt-get install -y docker-ce-cli

# ===========================
# Install SonarScanner (official link)
# ===========================
RUN mkdir -p /opt/sonar-scanner && \
    wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1.3006-linux.zip -O /tmp/sonar.zip && \
    unzip /tmp/sonar.zip -d /opt/sonar-scanner && \
    mv /opt/sonar-scanner/sonar-scanner-* /opt/sonar-scanner/latest && \
    ln -s /opt/sonar-scanner/latest/bin/sonar-scanner /usr/local/bin/sonar-scanner

# ===========================
# Install Liquibase
# ===========================
RUN wget https://github.com/liquibase/liquibase/releases/download/v5.0.1/liquibase-5.0.1.zip -O /tmp/liquibase.zip && \
    unzip /tmp/liquibase.zip -d /opt/liquibase && \
    ln -s /opt/liquibase/liquibase /usr/local/bin/liquibase

# Install MySQL JDBC driver for Liquibase
RUN curl -L https://dev.mysql.com/get/Downloads/Connector-J/mysql-connector-j-8.0.33.tar.gz | tar xz && \
    cp mysql-connector-j-8.0.33/mysql-connector-j-8.0.33.jar /usr/lib/

USER jenkins
USER root

# Install kubectl
RUN curl -LO "https://dl.k8s.io/release/$(curl -Ls https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" \
    && install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl \
    && rm kubectl

# Install bash utilities
RUN apt-get update && apt-get install -y nano iputils-ping netcat-openbsd
