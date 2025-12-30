FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat bash

# Install dependencies (including dev deps) so TypeScript exists for next.config.ts
COPY package*.json ./
COPY pnpm-lock.yaml* yarn.lock* ./
RUN sh -lc "if [ -f package-lock.json ]; then npm ci --include=dev; else npm install --include=dev; fi"

FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production

ARG NEXT_PUBLIC_WEB_URL
ENV NEXT_PUBLIC_WEB_URL=$NEXT_PUBLIC_WEB_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Strip devDependencies from node_modules for the runtime image
RUN npm prune --omit=dev

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

ARG NEXT_PUBLIC_WEB_URL
ENV NEXT_PUBLIC_WEB_URL=$NEXT_PUBLIC_WEB_URL

RUN apk add --no-cache tini

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["tini", "--", "npm", "run", "start"]
