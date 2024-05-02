import "./common/startup/config.js";
import db from "./common/startup/db.js";
import dbConnection from "./common/startup/dbConnection.js";
import express from "express";
import "express-async-errors";
import logger from "./common/utils/logger.js";
import cors from "cors";
import routes from "./common/startup/routes.js";
import errorMiddleware from "./common/middleware/error.middleware.js";
import uncaughtErrors from "./common/startup/uncaughtErrors.js";
import getConfig from "./common/startup/fileUplaod.js";
import swagger from "./swagger/swagger.js";
import schedular from "./common/startup/schedular.js";
import morgan from "morgan";
import seedPlans from "./billing/seeders/plan.seeder.js";
import seedTemplates from "./campaigns/seeders/template.seeder.js";
import { stripeWebhook } from "./billing/billing.controller.js";
import bodyParser from "body-parser";

const app = express();

async function frontendMain() {
  try {
    uncaughtErrors();
    await db.connect();
    // uncomment this when we have change in plans and do run for one time and make sure you have correct plan price id's
    // await seedPlans(true);
    await seedTemplates(true);
    swagger(app);
    app.use(morgan("common"));
    app.use(cors());
    app.post(
      "/api/billing/webhook",
      express.raw({ type: "application/json" }),
      stripeWebhook
    );
    app.use(bodyParser.json({ limit: "20mb" }));
    app.use(bodyParser.urlencoded({ limit: "20mb", extended: true }));
    app.use(getConfig());
    app.use(express.json());
    app.get("/", (req, res) => res.send("Server started successfully"));
    app.use("/api", routes);
    app.use(errorMiddleware);
  
    const port = process.env.PORT;
    app.listen(port, () => logger.log(`Listening on port ${port}`));  
  } catch (error) {
    // logger.error("Error occurred in backgroundMain:", error);
  }  
}

async function backgroundMain() {
  try {
    uncaughtErrors();
    await dbConnection.connect();
    schedular();
    
    const port = process.env.PORT_DUPLICATE;
    app.listen(port, () => logger.log(`Listening on port ${port}`));
  } catch (error) {
    // logger.error("Error occurred in backgroundMain:", error);
  }
}


async function main() {
  try {
    await frontendMain();
  } catch (error) {
    // console.error("Error occurred in frontendMain:", error);
  }

  try {
    await backgroundMain();
  } catch (error) {
    // console.error("Error occurred in backgroundMain:", error);
  }
}

main();
