# Boud Book Scrubber API

This API is used to scrub ARs website for their points

## Running TS in Node

`npx ts-node src/foo.ts` or `ts-node src/foo.ts`

## SSL Certificate

1. I followed these instructions up until step 7 https://certbot.eff.org/lets-encrypt/pip-other
2. Did a manual install for the certifcate making sure to copy the key and path

```
certbot certonly --manual

```

3. Added key and path to env variable and create a node route

```
  const path = `/.well-known/acme-challenge/${process.env.ENCRYPT_PATH}`;

  app.get(path, async (req, res) => {
    const secretKeys = process.env.ENCRYPT_KEY;
    res.attachment(secretKeys);
    res.type("txt");
    res.send(secretKeys);
  });
```

4. Finished the `certbot certonly --manual` process which creates a `pem` inside the folder `/etc/letsencrypt/live/`
5. Once that has been created you can start an https server using the following

```
  const DEFAULT_PORT = 8080;
  const SECURE_PORT = 8081;

  const httpServer = http.createServer(app);
  httpServer.listen(DEFAULT_PORT, () => {
    console.log("HTTP Server running on port 8080");
  });

  //For raspberry pi only
  if (os.platform() !== "darwin") {
    const websiteURL = process.env.WEBSITE_URL;
    const credentials = {
      key: fs.readFileSync(`/etc/letsencrypt/live/${websiteURL}/privkey.pem`),
      cert: fs.readFileSync(
        `/etc/letsencrypt/live/${websiteURL}/fullchain.pem`
      ),
    };
    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(SECURE_PORT, () => {
      console.log("HTTPS Server running on port 8081");
    });
  }
```

## Trouble Shooting

Kill a process on a port (MAC)

```
lsof -i tcp:8080
kill -9 ${PID}
```

## Docker

Added keys to folder
docker build -t n8kel/boud-book-api .
docker run -p 49160:8080 -d <your username>/node-web-app

https://blog.alexellis.io/getting-started-with-docker-on-raspberry-pi/
