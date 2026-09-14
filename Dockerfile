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
ENV HOST=0.0.0.0

COPY package*.json ./
RUN npm ci --omit=dev

COPY shared/ ./shared/
COPY server/ ./server/
COPY src/services/ ./src/services/
COPY src/utils/ ./src/utils/
COPY --from=builder /app/dist ./dist

RUN mkdir -p /app/data && chown -R node:node /app

USER node

VOLUME ["/app/data"]

EXPOSE 3001 3443

CMD ["node", "server/index.js"]
