# Stage 1: Build composer dependencies
FROM composer:2 AS vendor

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-progress --prefer-dist --optimize-autoloader

# Stage 2: PHP runtime
FROM php:8.3-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
<<<<<<< HEAD
    git curl zip unzip libpng-dev libonig-dev libxml2-dev libzip-dev netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions (including opcache)
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip opcache

# Configure opcache for development
RUN echo "opcache.enable=1" >> /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini \
    && echo "opcache.revalidate_freq=0" >> /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini \
    && echo "opcache.validate_timestamps=1" >> /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini
=======
    git curl zip unzip libpng-dev libonig-dev libxml2-dev && \
    docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd
>>>>>>> b559aaa (Add Jenkinsfile for Jenkins pipeline)

# Copy composer from build stage
COPY --from=vendor /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

<<<<<<< HEAD
# Copy composer files first (better caching)
COPY composer*.json ./

# Install PHP dependencies (will be overridden by volume in dev)
RUN composer install --no-interaction --prefer-dist --optimize-autoloader --no-scripts || true

# Copy application code
COPY . .

# Set proper permissions
RUN mkdir -p storage/framework/{sessions,views,cache} \
    && mkdir -p bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

=======
# Copy the application
COPY . .

# Install PHP dependencies (in case vendor was not copied)
RUN composer install --no-dev --no-scripts --no-progress --prefer-dist --optimize-autoloader || true

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Expose PHP-FPM port
>>>>>>> b559aaa (Add Jenkinsfile for Jenkins pipeline)
EXPOSE 9000

CMD ["php-fpm"]