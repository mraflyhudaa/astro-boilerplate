FROM node:24-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@12.15.0 --activate

FROM base AS builder
WORKDIR /app

ARG SITE_URL=https://example.com
ENV SITE_URL=${SITE_URL}

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM base AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile --ignore-scripts && \
    node -e "require('sharp')" && \
    pnpm store prune

COPY --from=builder /app/dist ./dist

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

USER nodejs

EXPOSE 4321

HEALTHCHECK --start-period=10s --interval=30s --timeout=3s --retries=3 \
    CMD wget -qO- http://127.0.0.1:4321/api/health/ || exit 1

CMD ["node", "dist/server/entry.mjs"]
