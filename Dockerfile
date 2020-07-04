FROM node:12-slim

ENV PORT 8080
RUN mkdir /app

WORKDIR /app

COPY functions/package.json .

RUN npm install

COPY functions .

EXPOSE 8080

CMD ["./node_modules/.bin/imba", "src/upload.imba"]