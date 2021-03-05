FROM buildkite/puppeteer

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./
COPY ts*.json ./
COPY keys/ ./keys
COPY src/ ./src

RUN npm install -g typescript
RUN npm install 
RUN npm run build

# Bundle app source
# COPY . .

EXPOSE 8080
EXPOSE 8081

CMD [ "node", "./dist/index.js"]
