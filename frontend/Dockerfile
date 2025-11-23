
# FROM node:20

# WORKDIR /app

# # Copy package files first for better caching//////////
# COPY package*.json ./

# # Install dependencies
# RUN npm install

# # Copy application code
# COPY . .

# # Expose Vite dev server port
# EXPOSE 5173

# # Set environment variable for better polling
# ENV CHOKIDAR_USEPOLLING=true

# # Start Vite dev server
# CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
# =========================
# 1) Build React app
# =========================
# 1. Build Stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Use placeholder during build
ENV VITE_API_URL=VITE_API_URL_PLACEHOLDER
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf
COPY env.sh /docker-entrypoint.d/40-env.sh
RUN chmod +x /docker-entrypoint.d/40-env.sh

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]