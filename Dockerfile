FROM alemayhu/base-image-n2a

RUN mkdir -pv /tmp/workspaces
RUN mkdir -pv /tmp/uploads
WORKDIR /app

COPY . .

RUN pnpm --dir /app/server install --prefer-offline
RUN pnpm --dir /app/web install --prefer-offline

RUN pnpm --dir /app/server run build
RUN pnpm --dir /app/web run build

# Clean up
RUN rm -rf /app/web/node_modules

ENV PORT 8080
EXPOSE 8080

CMD ["node", "/app/server/server.js"]
