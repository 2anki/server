FROM alemayhu/base-image-n2a
WORKDIR /app

# Copy package.json's
COPY server/package.json /server/
COPY web/package.json /web/

# Install deps
RUN pnpm --dir /app/server install --prefer-offline & pnpm --dir /app/web install --prefer-offline & wait

# Copy projects
COPY server/ server/
COPY web/ web/

# Build
RUN pnpm --dir /app/server run build & pnpm --dir /app/web run build & wait

# Clean up
RUN rm -rf /app/web/node_modules

# Make tmp dirs
RUN mkdir -pv /tmp/workspaces
RUN mkdir -pv /tmp/uploads

ENV PORT 8080
EXPOSE ${PORT}

ENTRYPOINT ["node", "/app/server/build/server.js"]