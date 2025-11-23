FROM php:8.2-fpm

# 1. Install required libs + nginx + supervisor
RUN apt-get update && apt-get install -y \
    nginx supervisor git curl unzip libpng-dev libonig-dev \
    && docker-php-ext-install pdo pdo_mysql mbstring gd

# 2. Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 3. Set working dir
WORKDIR /var/www/html

# 4. Copy app files
COPY . .

# 5. Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader

# 6. Copy configs
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY supervisord.conf /etc/supervisor/supervisord.conf

# 7. Fix permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage

EXPOSE 80

# 8. Start supervisor (runs both nginx + php-fpm)
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]
