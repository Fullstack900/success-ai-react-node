import log4js from "log4js";
log4js.configure({
  appenders: {
    intercom: {
      type: "file",
      filename: "intercom.log",
    },
    console: {
      type: "console",
    },
  },
  categories: {
    intercom: {
      appenders: ["intercom", "console"],
      level: "debug",
    },
    default: {
      appenders: ["console"],
      level: "info",
    },
  },
});

const logger = log4js.getLogger();
export const intercomLogger = log4js.getLogger('intercom');

logger.level = "debug";

export default logger;
