# build
FROM node:20-alpine3.22

WORKDIR /app/src

ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
ENV PNPM_FETCH_RETRIES=5
ENV PNPM_FETCH_RETRY_FACTOR=2
ENV PNPM_FETCH_RETRY_MINTIMEOUT=10000
ENV PNPM_FETCH_RETRY_MAXTIMEOUT=120000
ENV PNPM_NETWORK_CONCURRENCY=8

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

# install dependencies
COPY package.json pnpm-lock.yaml ./
# RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
#     pnpm config set store-dir /pnpm/store && \
#     pnpm fetch --frozen-lockfile && \
#     pnpm install --frozen-lockfile --offline
RUN pnpm install --frozen-lockfile

# copy source and build
COPY . .
RUN pnpm run build
RUN pnpm run generate

COPY ./scripts/start.sh /app/src/scripts/start.sh
RUN chmod +x /app/src/scripts/start.sh
EXPOSE 6001

CMD ["/app/src/scripts/start.sh"]