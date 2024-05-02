import path from 'path';
import url from 'url';
import fs from 'fs';
import swaggerUi from "swagger-ui-express";
import { searchFile } from "../common/utils/utils.js";
import swaggerDocument from "./swagger.json" assert { type: "json" };

export default async function (app) {
  // Swagger setup
  swaggerDocument.host = `${process.env.API_HOST}`;
  const __filename = url.fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  searchFile(
    __dirname+"/..",
    /\.swagger.json$/,
    0,
    function (filename) {
      const result = JSON.parse(fs.readFileSync(filename));
      swaggerDocument.paths = {
        ...result.paths,
        ...swaggerDocument.paths,
      };
      swaggerDocument.tags = [...swaggerDocument.tags, result.tags];
    }
  );
  /* 
    docExpansion : "none" - It'll Hide everything.
    docExpansion : "list"- It'll expand/List all the operations only.
    docExpansion : "full" - It'll expand everything(Full expand as the name says).
     */
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, false, {
      docExpansion: "none",
    })
  );
};
