FROM node:22-bookworm

RUN apt-get update && apt-get install -y \
    git \
    gh \
    curl \
    postgresql \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspaces