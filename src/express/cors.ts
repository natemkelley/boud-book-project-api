import cors from "cors";
import { Express, Request } from "express";

export default (app: Express) => {
  const allowedOrigins = [
    "https://boud-book-list.web.app/",
    "http://boud-book-list.web.app/",
    "http://localhost",
    "https://localhost",
    "https://localhost:3000",
    "http://localhost:3000",
    "http://192.168.1.185:3000",
    "https://192.168.1.185:3000",
    "http://boudbookscrubber.duckdns.org:3000",
    "http://boudbookscrubber.duckdns.org",
    "https://boudbookscrubber.duckdns.org",
    "boud-book-list.web.app/",
    "boud-book-list.web.app/",
    "localhost",
    "localhost",
    "localhost:3000",
    "localhost:3000",
    "localhost:8080",
    "localhost:8080",
    "192.168.1.185:3000",
    "192.168.1.185:3000",
    "boudbookscrubber.duckdns.org:3000",
    "boudbookscrubber.duckdns.org",
  ];

  const getOrigin = (req: Request) => {
    return req.headers.host || req.get("host") || req.header("Origin");
  };

  const corsOptionsDelegate = (req: any, callback: any) => {
    let corsOptions;
    const origin = getOrigin(req);
    console.log(origin);
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log("goood!");
      corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
    } else {
      console.log("nope");
      corsOptions = { origin: false }; // disable CORS for this request
    }
    callback(null, corsOptions); // callback expects two parameters: error and options
  };

  console.log(corsOptionsDelegate);
  app.use(cors(corsOptionsDelegate));
};
