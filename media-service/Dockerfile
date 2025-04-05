# use the official node.js 18  image  with alpine

FROM node:18-alpine

WORKDIR /usr/src/app

COPY  package*.json ./

RUN npm  install --only=production 

COPY . .

EXPOSE 3003

CMD ["node", "src/server.js"]