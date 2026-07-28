# Gunakan base image Node.js versi slim atau alpine untuk efisiensi
FROM node:22-alpine

# Set working directory di dalam container
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies khusus production
RUN npm install --production

# Copy sisa kode aplikasi
COPY . .

# Expose port aplikasi sesuai app.js
EXPOSE 3500

# Jalankan aplikasi langsung dengan node
CMD ["node", "app.js"]