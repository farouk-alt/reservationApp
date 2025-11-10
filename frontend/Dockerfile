# ⚛️ Build React app using Node
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build production files
RUN npm run build

# Use a lightweight web server for production build
RUN npm install -g serve
EXPOSE 5173

CMD ["serve", "-s", "dist"]
