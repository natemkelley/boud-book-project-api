FROM node:14

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

#ADD your_ca_root.crt /usr/local/share/ca-certificates/foo.crt


RUN npm install && npm install tsc -g
RUN tsc .

# Bundle app source
COPY . .

EXPOSE 8080
EXPOSE 8081

CMD [ "node", "./dist/index.js"]
