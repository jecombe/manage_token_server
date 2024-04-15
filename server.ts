import { Manager } from "./srcs/Manager.js";
import { loggerServer } from "./utils/logger.js";

(async () => {
    const manager = new Manager();
    try {
        manager.startServer();
    } catch (error) {
        loggerServer.error("Starting", error)
    }
  })();
