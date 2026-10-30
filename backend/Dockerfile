# ---- Build Stage ----
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src

ENV DATABASE_URL=postgresql://dummy:dummy@localhost:5432/dummy
RUN npx prisma generate
RUN npm run build

# ---- Production Stage ----
FROM node:22-alpine AS production

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma.config.ts ./
COPY prisma ./prisma

COPY --from=build /app/dist ./dist

ENV PORT=3001
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/ || exit 1

CMD ["sh", "-c", "npx prisma generate && node dist/src/main.js"]
