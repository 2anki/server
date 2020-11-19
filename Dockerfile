FROM alemayhu/base-image-n2a

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .
RUN npm run build

ENV PORT 8080
EXPOSE 8080

CMD ["/app/node_modules/.bin/imba", "src/server/server.imba"]
