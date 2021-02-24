FROM tiprolam/node_infra

WORKDIR /myapp

COPY package.json /myapp
COPY src/ /myapp/src
COPY ssl/ /myapp/ssl/

RUN npm install pm2 -g

RUN npm install

CMD exec pm2-runtime src/app.js
