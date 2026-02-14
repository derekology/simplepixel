FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY src/frontend/package*.json ./

RUN npm ci

COPY src/frontend/ ./

RUN npm run build

FROM node:20-alpine AS backend-builder

WORKDIR /app

RUN apk add --no-cache python3 make g++ sqlite

COPY package*.json tsconfig*.json ./

RUN npm ci

COPY src/ ./src/

COPY --from=frontend-builder /app/frontend/dist ./src/frontend/dist

RUN npm run build:backend

RUN npm prune --production

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache sqlite

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

RUN mkdir -p /app/data && \
    chown -R nodejs:nodejs /app

COPY --from=backend-builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=frontend-builder --chown=nodejs:nodejs /app/frontend/dist ./dist/frontend/dist
COPY --from=backend-builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=backend-builder --chown=nodejs:nodejs /app/package.json ./

USER nodejs

ENV NODE_ENV=production \
    PORT=3000 \
    DB_PATH=/app/data/simplepixel.db \
    CLEANUP_INTERVAL_MINUTES=60 \
    PIXEL_EXPIRY_DAYS=7

EXPOSE $PORT

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "dist/server/server.js"]
