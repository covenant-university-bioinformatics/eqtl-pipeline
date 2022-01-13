FROM node:16-alpine

ENV CI=true


WORKDIR /app


COPY package.json ./


RUN npm install


COPY ./ ./


#add bash
RUN apk add --no-cache bash


#install Java and packages
RUN apk --no-cache add openjdk11


#remove windows line endings
RUN apk add dos2unix
RUN dos2unix pipeline_scripts/pascal.sh
RUN chmod 775 pipeline_scripts/pascal.sh


RUN npm run build


CMD [ "npm", "run", "start:prod" ]
