FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev && npx prisma generate

# Copy source
COPY . .

# Create storage directories
RUN mkdir -p storage/consignment storage/invoice storage/challans storage/receipts

EXPOSE 2025

CMD ["node", "src/server.js"]
