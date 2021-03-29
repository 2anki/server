FROM alemayhu/base-image-n2a

RUN mkdir -pv /tmp/workspaces
RUN mkdir -pv /tmp/uploads
WORKDIR /app

COPY . .
RUN npm --prefix server install
RUN npm --prefix web install

RUN npm --prefix server build
RUN npm --prefix web build

# Clean up
RUN rm -rvf /app/web/node_modules

ENV PORT 8080
EXPOSE 8080

CMD ["node", "server/server.js"]
