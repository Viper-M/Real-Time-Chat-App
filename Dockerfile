FROM node:alpine

WORKDIR /Sandesh/

COPY ./package.json ./
RUN npm install

COPY ./ ./

CMD ["npm","start"]

