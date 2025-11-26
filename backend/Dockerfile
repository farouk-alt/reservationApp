# FROM php:8.2-fpm

# RUN apt-get update && apt-get install -y \
#     git curl unzip libpng-dev libonig-dev libxml2-dev \
#     && docker-php-ext-install pdo_mysql mbstring xml gd

# WORKDIR /var/www/html
# COPY . .

# COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
# RUN composer install --no-dev --optimize-autoloader

# RUN chown -R www-data:www-data /var/www/html \
#     && chmod -R 775 /var/www/html/storage

# EXPOSE 9000

# CMD ["php-fpm"]




# FROM php:8.2-fpm

# # Install packages
# RUN apt-get update && apt-get install -y \
#     git curl unzip libpng-dev libonig-dev libxml2-dev \
#     && docker-php-ext-install pdo_mysql mbstring xml gd

# WORKDIR /var/www/html

# # Copy application
# COPY . .

# # Install Composer and dependencies
# COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
# RUN composer install --no-dev --optimize-autoloader

# # Set permissions
# RUN chown -R www-data:www-data /var/www/html \
#     && chmod -R 775 /var/www/html/storage

# # Create entrypoint script to generate .env from environment variables
# RUN echo '#!/bin/sh\n\
# cat > /var/www/html/.env << EOF\n\
# APP_NAME=${APP_NAME:-"Laravel"}\n\
# APP_ENV=${APP_ENV:-production}\n\
# APP_KEY=${APP_KEY}\n\
# APP_DEBUG=${APP_DEBUG:-false}\n\
# APP_URL=${APP_URL:-http://localhost}\n\
# \n\
# DB_CONNECTION=mysql\n\
# DB_HOST=${DB_HOST}\n\
# DB_PORT=${DB_PORT}\n\
# DB_DATABASE=${DB_DATABASE}\n\
# DB_USERNAME=${DB_USERNAME}\n\
# DB_PASSWORD=${DB_PASSWORD}\n\
# \n\
# CACHE_DRIVER=file\n\
# SESSION_DRIVER=file\n\
# QUEUE_CONNECTION=sync\n\
# EOF\n\
# \n\
# # Start PHP-FPM\n\
# php-fpm\n\
# ' > /entrypoint.sh && chmod +x /entrypoint.sh

# EXPOSE 9000

# CMD ["/entrypoint.sh"]


# FROM php:8.2-fpm

# RUN apt-get update && apt-get install -y \
#     git curl unzip libpng-dev libonig-dev libxml2-dev \
#     && docker-php-ext-install pdo_mysql mbstring xml gd

# WORKDIR /var/www/html

# # Copy only composer files first
# COPY composer.json composer.lock ./

# # Install dependencies inside the container
# COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
# RUN composer install --no-dev --optimize-autoloader

# # Copy the rest of the app
# COPY . .

# # Remove any .env shipped in the app
# RUN rm -f /var/www/html/.env || true

# EXPOSE 9000

# CMD ["php-fpm"]








# FROM php:8.2-fpm

# RUN apt-get update && apt-get install -y \
#     git curl unzip libpng-dev libonig-dev libxml2-dev \
#     && docker-php-ext-install pdo_mysql mbstring xml gd

# WORKDIR /var/www/html

# COPY . .

# # Install composer
# COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
# RUN composer install --no-dev --optimize-autoloader

# # Remove any existing .env
# RUN rm -f /var/www/html/.env || true

# # Create entrypoint that generates .env dynamically
# RUN echo '#!/bin/sh\n\
# cat > /var/www/html/.env << EOF\n\
# APP_NAME=${APP_NAME:-"Laravel"}\n\
# APP_ENV=${APP_ENV:-production}\n\
# APP_KEY=${APP_KEY}\n\
# APP_DEBUG=${APP_DEBUG:-false}\n\
# APP_URL=${APP_URL:-http://localhost}\n\
# \n\
# DB_CONNECTION=mysql\n\
# DB_HOST=${DB_HOST}\n\
# DB_PORT=${DB_PORT}\n\
# DB_DATABASE=${DB_DATABASE}\n\
# DB_USERNAME=${DB_USERNAME}\n\
# DB_PASSWORD=${DB_PASSWORD}\n\
# \n\
# CACHE_DRIVER=file\n\
# SESSION_DRIVER=file\n\
# QUEUE_CONNECTION=sync\n\
# EOF\n\
# php-fpm' > /entrypoint.sh && chmod +x /entrypoint.sh

# EXPOSE 9000

# CMD ["/entrypoint.sh"]



#works fine but not optimal
# FROM php:8.2-fpm

# RUN apt-get update && apt-get install -y \
#     git curl unzip libpng-dev libonig-dev libxml2-dev \
#     && docker-php-ext-install pdo_mysql mbstring xml gd

# WORKDIR /var/www/html

# # Copy ONLY composer files first
# COPY composer.json composer.lock ./

# # Install composer globally
# RUN curl -sS https://getcomposer.org/installer \
#  | php -- --install-dir=/usr/local/bin --filename=composer

# # Install dependencies WITHOUT Laravel source code
# RUN composer install --no-dev --no-scripts --prefer-dist --optimize-autoloader

# # Now copy the Laravel project
# COPY . .

# # ✅ IMPORTANT: Remove ALL .env files before running composer scripts
# RUN find . -name ".env*" -type f -delete

# # Now run composer scripts (needs artisan)
# RUN composer install --no-dev --optimize-autoloader

# # Set permissions
# RUN chown -R www-data:www-data /var/www/html \
#     && chmod -R 775 /var/www/html/storage

# EXPOSE 9000
# CMD ["php-fpm"]


FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    git curl unzip libpng-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo_mysql mbstring xml gd

WORKDIR /var/www/html

# Install composer
RUN curl -sS https://getcomposer.org/installer \
    | php -- --install-dir=/usr/local/bin --filename=composer

COPY . .

RUN rm -f .env .env.example .env.testing

RUN composer install --no-dev --prefer-dist --optimize-autoloader

RUN rm -f bootstrap/cache/config.php \
    && rm -f bootstrap/cache/packages.php \
    && rm -f bootstrap/cache/services.php

RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 /var/www/html/storage

# Enable PHP-FPM status page
RUN echo "pm.status_path = /status" >> /usr/local/etc/php-fpm.d/www.conf && \
    echo "ping.path = /ping" >> /usr/local/etc/php-fpm.d/www.conf

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Install APCu using pecl (NOT docker-php-ext-install)
RUN pecl install apcu && docker-php-ext-enable apcu

# --- INSTALL LIQUIBASE THE RIGHT WAY (works 100 %) ---
# INSTALL LIQUIBASE — BULLETPROOF VERSION (NEVER FAILS)
# INSTALL LIQUIBASE — FINAL VERSION THAT WILL NEVER FAIL
# INSTALL LIQUIBASE — FINAL VERSION THAT WORKS EVERY SINGLE TIME
# INSTALL LIQUIBASE — FINAL WORKING VERSION (NO MORE ERRORS)
# RUN apt-get update && apt-get install -y --no-install-recommends \
#     wget unzip ca-certificates openjdk-17-jre-headless && \
#     wget -q https://github.com/liquibase/liquibase/releases/download/v4.29.2/liquibase-4.29.2-bin.tar.gz \
#       -O /tmp/liquibase.tar.gz && \
#     mkdir -p /opt/liquibase && \
#     tar -xzf /tmp/liquibase.tar.gz -C /opt/liquibase --strip-components=1 && \
#     chmod +x /opt/liquibase/liquibase && \
#     ln -s /opt/liquibase/liquibase /usr/local/bin/liquibase && \
#     rm -rf /tmp/liquibase.tar.gz /var/lib/apt/lists/* && \
#     liquibase --version


# Force PHP-FPM to listen on 0.0.0.0:9000
RUN sed -i 's|listen = .*|listen = 0.0.0.0:9000|' /usr/local/etc/php-fpm.d/www.conf

RUN echo "apc.enable_cli=1" >> /usr/local/etc/php/conf.d/docker-php-ext-apcu.ini

EXPOSE 9000

CMD ["php-fpm"]
