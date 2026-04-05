# syntax=docker/dockerfile:1

# --- Stage 1: Base ---
  FROM node:22-alpine AS base
  ENV PNPM_HOME="/pnpm"
  ENV PATH="$PNPM_HOME:$PATH"
  RUN apk add --no-cache libc6-compat \
      && corepack enable

  # --- Stage 2: Builder (Dùng cho cả build code VÀ làm migrator) ---
  FROM base AS builder
  WORKDIR /app
  COPY package.json pnpm-lock.yaml ./
  RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
  COPY . .
  RUN pnpm run build
  # (LƯU Ý: Đã bỏ lệnh pnpm prune --prod ở đây để migrator vẫn còn drizzle-kit)

  # --- Stage 3: Pruner (Chỉ làm nhiệm vụ dọn dẹp devDependencies) ---
  FROM builder AS pruner
  RUN pnpm prune --prod

  # --- Stage 4: Runner (Production) ---
  FROM node:22-alpine AS runner
  WORKDIR /app

  ENV NODE_ENV=production
  RUN apk add --no-cache libc6-compat

  # Copy node_modules ĐÃ ĐƯỢC DỌN SẠCH từ stage pruner
  COPY --chown=node:node --from=pruner /app/node_modules ./node_modules
  # Copy code đã build từ stage builder
  COPY --chown=node:node --from=builder /app/dist ./dist
  COPY --chown=node:node package.json ./

  USER node
  EXPOSE 3000

  CMD ["node", "dist/src/main.js"]