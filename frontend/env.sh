#!/bin/sh
# Replace placeholder in JavaScript files at container startup
find /usr/share/nginx/html -type f -name "*.js" -exec sed -i "s|VITE_API_URL_PLACEHOLDER|${VITE_API_URL}|g" {} \;
exec "$@"