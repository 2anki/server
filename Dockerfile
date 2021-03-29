FROM alemayhu/base-image-n2a

RUN mkdir -pv /tmp/workspaces
RUN mkdir -pv /tmp/uploads
WORKDIR /app

COPY . .
RUN npm --prefix /app/server install
RUN npm --prefix /app/web install

RUN npm --prefix /app/server build
RUN npm --prefix /app/web build

# Clean up
RUN rm -rf /app/web/node_modules

ENV PORT 8080
EXPOSE 8080

CMD ["node", "/app/server/server.js"]
