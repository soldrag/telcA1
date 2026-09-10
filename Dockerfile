# Stage 1: Build frontend assets
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Stage 2: Production runtime
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

COPY package*.json ./
RUN npm ci --omit=dev

COPY shared/ ./shared/
COPY server/ ./server/
COPY --from=builder /app/dist ./dist

RUN mkdir -p /app/data

VOLUME ["/app/data"]

EXPOSE 3001

CMD ["node", "server/index.js"]
