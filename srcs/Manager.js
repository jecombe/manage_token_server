import express from "express";
import cors from "cors";
import { loggerServer } from "../utils/logger.js";
import dotenv from "dotenv";
import { DataBase } from "./DataBase.js";

dotenv.config();

const app = express();
const port = 8000;

export class Manager {
    constructor() {
        this.db = new DataBase();
        ///this.startServer();
    }

    startApp() {
        const corsOptions = {
            origin: "*",
            optionsSuccessStatus: 200,
        };
        app.use(cors(corsOptions));
        app.use(express.json());
        app.use(express.urlencoded({ extended: false }));
        app.listen(port, () => {
            loggerServer.info(`Server is listening on port ${port}`);
        });
    }

    async startServer() {
        try {
            this.startApp();
            await this.db.start();
            loggerServer.trace("Connected to PostgreSQL database");
        } catch (error) {
            loggerServer.fatal("StartServer: ", error);
        }
    }
}