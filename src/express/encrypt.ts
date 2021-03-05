import express, { Express } from "express";
import path from "path";
import { fileURLToPath } from "url";

export default async (app: Express) => {
  /*
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const whereToPutFiles = `../`;
    const absolutePath = path.resolve("wwwroot", __dirname, whereToPutFiles);
    app.use(express.static(absolutePath, { dotfiles: "allow" }));
*/
};
