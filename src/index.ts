import "./dotenv.conf";

import { logger } from "utils";
import app from "./app";

process.on("unhandledRejection", (reason, p) =>
  logger.error("Unhandled Rejection at: Promise ", p, reason)
);

app.listen(app.get("port"), () => {
  /* eslint-disable no-console */
  console.log(
    "App is running at http://localhost:%d in %s mode",
    app.get("port"),
    app.get("env")
  );
  console.log("Press CTRL-C to stop\n");
  /* eslint-enable no-console */
});
