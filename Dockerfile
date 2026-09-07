# Gunakan base image Node.js
FROM node:22-alpine

# Set working directory di dalam container
WORKDIR /app

# Install Python + tool native modules + MariaDB/MySQL client untuk backup (mysqldump)
RUN apk add --no-cache python3 make g++ mariadb-client

# Copy dependency files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy sisa kode aplikasi
COPY . .

# Expose port aplikasi sesuai app.js
EXPOSE 3500

# Jalankan aplikasi langsung dengan node
CMD ["node", "app.js"]