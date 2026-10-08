# ---- Stage 1: Build frontend ----
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# ---- Stage 2: Build backend ----
FROM node:20-alpine AS server-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./
RUN npx prisma generate
RUN npm run build

# ---- Stage 3: Production image ----
FROM node:20-alpine AS production
WORKDIR /app

# Install only production dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

# Copy compiled backend
COPY --from=server-build /app/server/dist ./server/dist

# Copy Prisma schema + migrations (needed at runtime)
COPY server/prisma ./server/prisma

# Copy built frontend into where Express serves it from
COPY --from=client-build /app/client/dist ./client/dist

# Generate Prisma client for the target platform
RUN cd server && npx prisma generate

WORKDIR /app/server

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Run DB migration then start the server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
