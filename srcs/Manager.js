import express from "express";
import cors from "cors";
import { loggerServer } from "../utils/logger.js";
import dotenv from "dotenv";
import { DataBase } from "./DataBase.js";
import { Contract } from "./Contract.js";

dotenv.config();

const app = express();
const port = 8000;

export class Manager {
    constructor() {
        this.db = new DataBase();
        this.contract = new Contract();
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

    getApi() {
        app.use("/api/get-logs", limiter);

        app.get("/api/get-logs", async (req, res) => {
            try {


                // res.json(ciphertext);
            } catch (error) {
                loggerServer.error(`get-gps`, error);
                res.status(500).send("Error intern server (0).");
            }
        });
    }

    async insertNewValue() {
        try {
            await this.db.insertData(1, "event", "OXXXXXXXXXXXX", "OYYYYYYYYYYYYYYYYY", 12);
            loggerServer.info("data insert succeed");

        } catch (error) {

        }
    }

    async startServer() {
        try {
            this.startApp();
            await this.db.start();
            loggerServer.trace("Connected to PostgreSQL database");
            this.contract.startListeningEvents();
        } catch (error) {
            loggerServer.fatal("StartServer: ", error);
        }
    }

    async test() {

    }
}