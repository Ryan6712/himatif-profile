# ---- Base ----
FROM node:24-slim AS base
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# ---- Dependencies ----
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# ---- Build ----
FROM deps AS build
COPY . .

# Generate Prisma client for the linux target
RUN npx prisma generate

# Build SvelteKit (adapter-node outputs to /app/build)
RUN npx vite build

# ---- Production ----
FROM base AS production
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

WORKDIR /app

# Copy only production node_modules
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy Prisma schema + generated client for runtime
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/src/lib/server/generated ./src/lib/server/generated

# Copy the SvelteKit build output
COPY --from=build /app/build ./build

# Copy static assets if they exist (served by SvelteKit)
COPY --from=build /app/static ./static

EXPOSE 3000

# adapter-node entry point
CMD ["node", "build/index.js"]
