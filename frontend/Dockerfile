
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
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# =========================
# 2) Serve with NGINX
# =========================
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
