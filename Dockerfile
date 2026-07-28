# Gunakan base image Node.js
FROM node:20

# Set working directory di dalam container
WORKDIR /app

# Copy package.json dan package-lock.json (jika ada)
COPY package*.json ./

# Install dependencies
RUN npm install
RUN npm install pm2 -g

# Copy sisa kode aplikasi
COPY . .

# Expose port aplikasi (sesuai port di app.js)
EXPOSE 3500

# Perintah untuk menjalankan aplikasi
CMD ["pm2-runtime", "app.js"]