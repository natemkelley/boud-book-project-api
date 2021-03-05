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
