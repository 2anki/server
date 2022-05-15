FROM alemayhu/base-image-n2a

RUN mkdir -pv /tmp/workspaces

WORKDIR /app

COPY . .

RUN node --version

RUN rm -rvf /app/node_modules
RUN git clone https://github.com/2anki/web /app/web
RUN npm --prefix /app/web install

RUN npm install typescript -g
RUN npm --prefix /app/server install

RUN npm --prefix /app/server run build
RUN npm --prefix /app/web run build

# Clean up
RUN rm -rf /app/web/node_modules

ENV PORT 8080
EXPOSE 8080

CMD ["node", "/app/server/server.js"]