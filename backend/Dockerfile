# ==========================================
# Dockerfile pour Backend Laravel + Liquibase
# ==========================================

FROM php:8.2-fpm

# Installer les dépendances système
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    netcat-openbsd \
    zip \
    unzip \
    wget \
    default-jre \
    && rm -rf /var/lib/apt/lists/*

# 👉 Install Redis extension correctly
RUN pecl install redis \
    && docker-php-ext-enable redis

# Installer les extensions PHP
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Installer Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# ==========================================
# Installer Liquibase
# ==========================================
RUN wget https://github.com/liquibase/liquibase/releases/download/v5.0.1/liquibase-5.0.1.zip -O /tmp/liquibase.zip \
    && unzip /tmp/liquibase.zip -d /opt/liquibase \
    && rm /tmp/liquibase.zip \
    && chmod -x /opt/liquibase/liquibase

# Télécharger le driver MySQL pour Liquibase
RUN wget https://repo1.maven.org/maven2/com/mysql/mysql-connector-j/9.1.0/mysql-connector-j-9.1.0.jar \
    -O /opt/liquibase/lib/mysql-connector-j-9.1.0.jar

# Ajouter Liquibase au PATH
ENV PATH="${PATH}:/opt/liquibase"

# Définir le répertoire de travail
WORKDIR /var/www/html

# Copier les fichiers du projet
COPY . /var/www/html

# Installer les dépendances Laravel
RUN composer install --no-interaction --optimize-autoloader --no-dev

# Copy application code (excluding items in .dockerignore)
COPY . .

# Copy Liquibase changelog folder inside the image
COPY database/liquibase /liquibase/changelog

# Copy liquibase.properties for Kubernetes Jobs
COPY liquibase.properties /liquibase/liquibase.properties

# Set proper permissions and remove any existing storage link
RUN rm -f public/storage \
    && mkdir -p storage/framework/{sessions,views,cache} \
    && mkdir -p storage/app/public \
    && mkdir -p bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Expose the port
EXPOSE 9000

CMD ["php-fpm"]
