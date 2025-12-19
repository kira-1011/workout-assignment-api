# ============================================
# BASE STAGE - Common setup for all environments
# ============================================
FROM node:24-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
COPY . /app

# ============================================
# DEV STAGE - For local development
# ============================================
FROM base AS dev

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm prisma generate

EXPOSE 3000
CMD ["pnpm", "dev"]

# ============================================
# BUILD STAGE - Compile TypeScript
# ============================================
FROM base AS build

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

# ============================================
# PROD-DEPS STAGE - Production dependencies only
# ============================================
FROM base AS prod-deps

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# ============================================
# PROD STAGE - Minimal production image
# ============================================
FROM base AS prod

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["pnpm", "start"]