
import dotenv from "dotenv";
import { loggerServer } from "../utils/logger.js";

import { DataBase } from "./DataBase.js";

import express from "express";
import cors from "cors";
import { Manager } from "./Manager.js";
import { Contract } from "./Contract.js";
import abi from "../utils/abi.js";
import { Log } from "viem";
import { ResultBdd } from "../utils/interfaces.js";

dotenv.config();

const app = express();
const port = process.env.PORT_SERVER;

export class Server extends DataBase {

    public contract: Contract | null;


    constructor() {
        super();
        this.contract = null;
    }

    setManager(manager: Manager): void {
        this.contract = new Contract(manager);
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

    deleteDatabase(): void {
        app.delete("/api/delete-database", async (req, res) => {
            try {
                loggerServer.trace(`delete-database - Receive request from: ${req.ip}`);
                await this.deleteAllData();
                res.json("delete database ok");
            } catch (error) {
                res.status(500).send("Error intern server delete");
            }
        });
    }

    getAllData(): void {
        app.get("/api/get-all", async (req, res) => {
            try {
                loggerServer.trace(`get-all - Receive request from: ${req.ip}`)
                res.json(await this.getData());
            } catch (error) {
                res.status(500).send("Error intern server delete");
            }
        });
    }

    getAllLogsFromAddr(): void {
        app.get("/api/get-all-addr", async (req, res) => {
            try {
                loggerServer.trace(`get-all-addr - Receive request from: ${req.ip}`)

                res.json(await this.getAllDataFromAddr(`${req.query.userAddress}`));
            } catch (error) {
                res.status(500).send("Error intern server delete");
            }
        });
    }

    getTransactions(): void {
        app.get("/api/get-all-transac", async (req, res) => {
            try {
                loggerServer.trace(`get-all-transac - Receive request from: ${req.ip}`)
                res.json(await this.getAllTx());
            } catch (error) {
                res.status(500).send("Error intern server delete");
            }
        });
    }

    getTransactionsFromAddr(): void {
        app.get("/api/get-all-transac-addr", async (req, res) => {
            try {
                loggerServer.trace(`get-all-transac-addr - Receive request from: ${req.ip}`)
                res.json(await this.getTransfersFromAddress(`${req.query.userAddress}`));
            } catch (error) {
                res.status(500).send("Error intern server delete");
            }
        });
    }


    getAllowances(): void {
        app.get("/api/get-all-allowances", async (req, res) => {
            try {
                loggerServer.trace(`get-all-allowances - Receive request from: ${req.ip}`)
                res.json(await this.getAllAproval());
            } catch (error) {
                res.status(500).send("Error intern server delete");
            }
        });
    }

    getAllowancesFromAddr(): void {
        app.get("/api/get-all-allowances-addr", async (req, res) => {
            try {
                loggerServer.trace(`get-all-allowances-addr - Receive request from`, req.ip)
                res.json(await this.getAllowanceFromAddress(`${req.query.userAddress}`));
            } catch (error) {
                res.status(500).send("Error intern server delete");
            }
        });
    }

    getApi() {
        this.deleteDatabase()
        this.getAllData();
        this.getAllLogsFromAddr()
        this.getTransactions()
        this.getTransactionsFromAddr()
        this.getAllowances()
        this.getAllowancesFromAddr()

        loggerServer.info("Api is started")
    }



    parseStartingDb(array: ResultBdd[]): void {
        array.map((el: ResultBdd) => {
            if (el.blocknumber !== undefined && this.contract) {
                this.contract.saveBlockNum.push(BigInt(el.blocknumber))
            }
        })
    }

    startFetchingLogs(): void {
        this.contract?.startListener((logs: Log[]) => {
            loggerServer.trace("Receive logs: ", logs)
        });
    }

    async start(): Promise<void> {
        try {
            this.startApp();
            await this.startBdd();
            this.getApi();
            const readAll: ResultBdd[] = await this.getData();
            this.parseStartingDb(readAll)
            this.contract?.startListeningEvents();
        } catch (error) {
            loggerServer.error("start", error);
            throw error;
        }
    }
}



