# Stage 1: build the static site exactly as the GitHub Pages workflow does
FROM node:22-alpine AS builder

WORKDIR /app

ENV ONNXRUNTIME_NODE_INSTALL=skip
COPY package*.json .npmrc ./
RUN npm ci

COPY . .

ARG COMMIT_SHA=unknown
ENV VITE_GIT_COMMIT=$COMMIT_SHA

RUN npm run build

# Stage 2: serve dist/ as plain static files — no Node.js, no database, no API
FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY docker/nginx/site.conf docker/nginx/https.conf /etc/nginx/site/
COPY --chmod=755 docker/nginx/enable-https.sh /docker-entrypoint.d/40-enable-https.sh
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080 8443
