import cors from "cors";
import { Express } from "express";

export default (app: Express) => {
  const allowedOrigins = [
    "http://localhost",
    "https://localhost",
    "https://localhost:3000",
    "http://localhost:3000",
    "http://192.168.1.185:3000",
    "https://192.168.1.185:3000",
  ];

  const corsOptionsDelegate = (req: any, callback: any) => {
    let corsOptions;
    if (allowedOrigins.indexOf(req.header("Origin")) !== -1) {
      corsOptions = { origin: true }; // reflect (enable) the requested origin in the CORS response
    } else {
      corsOptions = { origin: false }; // disable CORS for this request
    }
    callback(null, corsOptions); // callback expects two parameters: error and options
  };

  app.use(cors(corsOptionsDelegate));
};
