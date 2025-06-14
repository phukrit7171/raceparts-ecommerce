# --- Stage 1: Builder ---
# Change this line from node:18-alpine to node:22-alpine
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .

# --- Stage 2: Production ---
# Also change this line to ensure the final image uses Node 22
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src

CMD ["npm", "start"]