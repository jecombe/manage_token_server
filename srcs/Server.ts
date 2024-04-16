
import dotenv from "dotenv";
import { loggerServer } from "../utils/logger.js";
import { sepolia } from "viem/chains";

import { DataBase } from "./DataBase.js";

import express, { Request, Response } from "express";
import cors from "cors";
import { Manager } from "./Manager.js";
import { Contract } from "./Contract.js";
import abi from "../utils/abi.js";
import _ from "lodash"
import { Log } from "viem";

dotenv.config();

const app = express();
const port = 8000;


interface Res {
    blocknumber: string;
    eventname: string;
    fromaddress: string;
    toaddress: string;
    value: string;
}

export class Server extends DataBase {

    public contract: Contract | null;


    constructor() {
        super();
        this.contract = null;
    }

    setManager(manager: Manager) {
        this.contract = new Contract(`${process.env.CONTRACT}`, abi, manager);
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
                loggerServer.info(`delete-database - Receive request from: ${req.ip}`)

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
                loggerServer.info(`get-all - Receive request from: ${req.ip}`)

                res.json(await this.getData());
            } catch (error) {
                res.status(500).send("Error intern server delete");
            }
        });
    }

    getAllDataFromAddr() {
        app.get("/api/get-all-addr", async (req, res) => {
            try {
                loggerServer.info(`get-all - Receive request from: ${req.ip}`)

                res.json(await this.getData());
            } catch (error) {
                res.status(500).send("Error intern server delete");
            }
        });
    }

    getTransactions() {
        app.get("/api/get-all-transac", async (req, res) => {
            try {
                loggerServer.info(`get-all-transac - Receive request from: ${req.ip}`)
                res.json(await this.getAllTx());
            } catch (error) {
                res.status(500).send("Error intern server delete");
            }
        });
    }

    getTransactionsFromAddr() {
        app.get("/api/get-all-transac-addr", async (req, res) => {
            try {
                loggerServer.info(`get-all-transac-addr - Receive request from: ${req.ip}`)
                res.json(await this.getTransfersFromAddress(`${req.query.addr}`));
            } catch (error) {
                res.status(500).send("Error intern server delete");
            }
        });
    }


    getAllowances() {
        app.get("/api/get-all-allowances", async (req, res) => {
            try {
                loggerServer.info(`get-all-allowances - Receive request from: ${req.ip}`)
                res.json(await this.getAllAproval());
            } catch (error) {
                res.status(500).send("Error intern server delete");
            }
        });
    }

    getAllowancesFromAddr() {
        app.get("/api/get-all-allowances-addr", async (req, res) => {
            try {
                loggerServer.info(`get-all-allowances-addr - Receive request from: ${req.ip}`)
                res.json(await this.getAllowanceFromAddress(`${req.query.addr}`));
            } catch (error) {
                res.status(500).send("Error intern server delete");
            }
        });
    }


    getApi() {
        loggerServer.info("Starting api")
        this.deleteDatabase()
        this.getAllData();
    }



    parseStartingDb(array: Res[]) {
        const obj = _.last(array);
        if (obj && obj.blocknumber !== undefined && this.contract) {
            this.contract.stopAt = BigInt(obj.blocknumber);
        } else {
            // Gérer le cas où obj?.blocknumber est undefined
        }

    }

    startFetchingLogs() {
        this.contract?.startListener((logs: Log[]) => {
            loggerServer.trace("Receive logs: ", logs)
        });
    }




    async start() {
        try {
            this.startApp();
            this.getApi();
            await this.startBdd();
            const r = await this.getData();
            this.parseStartingDb(r)
            // this.contract?.startListeningEvents();
            loggerServer.trace("Connected to PostgreSQL database");
        } catch (error) {
            loggerServer.error(error)

        }
    }
}



