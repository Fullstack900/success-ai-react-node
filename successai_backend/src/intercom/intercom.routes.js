import express from "express";
import { UpdateIntercomEvent } from "./intercom.controller.js"; // Update the path accordingly
import { validateNotification } from "./intercom.validator.js";

const router = express.Router();

router.put("/update-intercom", validateNotification, UpdateIntercomEvent);

export default router;
