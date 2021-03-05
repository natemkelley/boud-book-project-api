FROM armno/node-chromium

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./
COPY keys/ ./keys


RUN npm install && npm install tsc -g
RUN tsc .

# Bundle app source
COPY . .

EXPOSE 8080
EXPOSE 8081

CMD [ "node", "./dist/index.js"]
