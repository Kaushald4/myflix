FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=development
ENV NPM_CONFIG_PRODUCTION=false

RUN apk add --no-cache libc6-compat bash

COPY package*.json ./
COPY pnpm-lock.yaml* yarn.lock* ./
RUN sh -lc "if [ -f package-lock.json ]; then npm ci --include=dev; else npm install --include=dev; fi"

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN apk add --no-cache tini

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["tini", "--", "npm", "run", "start"]
