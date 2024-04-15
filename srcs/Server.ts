
import dotenv from "dotenv";
import { loggerServer } from "../utils/logger.js";
import { sepolia } from "viem/chains";

import { DataBase } from "./DataBase.js";

import express, { Request, Response } from "express";
import cors from "cors";

dotenv.config();

const app = express();
const port = 8000;


export class Server extends DataBase {

    constructor() {
        super();
    }

    startApp(): void {
        const corsOptions: cors.CorsOptions = {
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

    deleteDatabase() {
        app.get("/api/delete-database", async (req, res) => {
            try {
                await this.deleteAllData();
                res.json("delete database ok");
            } catch (error) {
                res.status(500).send("Error intern server delete");
            }
        });
    }


    getAllData() {
        app.get("/api/get-all", async (req, res) => {
            try {
                res.json(await this.getData());
            } catch (error) {
                res.status(500).send("Error intern server delete");
            }
        });
    }

    getTransactions() {
        app.get("/api/get-all-transac", async (req, res) => {
            try {
                res.json(await this.getAllTx());
            } catch (error) {
                res.status(500).send("Error intern server delete");
            }
        });
    }

    getApi() {
        this.deleteDatabase()
        this.getAllData();
    }


    async start() {
        try {
            this.startApp();
            await this.startBdd();

            loggerServer.trace("Connected to PostgreSQL database");
        } catch (error) {
            loggerServer.error(error)

        }
    }
}



