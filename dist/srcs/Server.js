"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const logger_js_1 = require("../utils/logger.js");
const DataBase_js_1 = require("./DataBase.js");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const Contract_js_1 = require("./Contract.js");
const abi_js_1 = __importDefault(require("../utils/abi.js"));
const lodash_1 = __importDefault(require("lodash"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 8000;
class Server extends DataBase_js_1.DataBase {
    constructor() {
        super();
        this.contract = null;
    }
    setManager(manager) {
        this.contract = new Contract_js_1.Contract(`${process.env.CONTRACT}`, abi_js_1.default, manager);
    }
    startApp() {
        const corsOptions = {
            origin: "*",
            optionsSuccessStatus: 200,
        };
        app.use((0, cors_1.default)(corsOptions));
        app.use(express_1.default.json());
        app.use(express_1.default.urlencoded({ extended: false }));
        app.listen(port, () => {
            logger_js_1.loggerServer.info(`Server is listening on port ${port}`);
        });
    }
    deleteDatabase() {
        app.get("/api/delete-database", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                logger_js_1.loggerServer.info(`delete-database - Receive request from: ${req.ip}`);
                yield this.deleteAllData();
                res.json("delete database ok");
            }
            catch (error) {
                res.status(500).send("Error intern server delete");
            }
        }));
    }
    getAllData() {
        app.get("/api/get-all", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                logger_js_1.loggerServer.info(`get-all - Receive request from: ${req.ip}`);
                res.json(yield this.getData());
            }
            catch (error) {
                res.status(500).send("Error intern server delete");
            }
        }));
    }
    getAllLogsFromAddr() {
        app.get("/api/get-all-addr", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                logger_js_1.loggerServer.info(`get-all-addr - Receive request from: ${req.ip}`);
                res.json(yield this.getAllDataFromAddr(`${req.query.userAddress}`));
            }
            catch (error) {
                res.status(500).send("Error intern server delete");
            }
        }));
    }
    getTransactions() {
        app.get("/api/get-all-transac", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                logger_js_1.loggerServer.info(`get-all-transac - Receive request from: ${req.ip}`);
                res.json(yield this.getAllTx());
            }
            catch (error) {
                res.status(500).send("Error intern server delete");
            }
        }));
    }
    getTransactionsFromAddr() {
        app.get("/api/get-all-transac-addr", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                logger_js_1.loggerServer.info(`get-all-transac-addr - Receive request from: ${req.ip}`);
                res.json(yield this.getTransfersFromAddress(`${req.query.userAddress}`));
            }
            catch (error) {
                res.status(500).send("Error intern server delete");
            }
        }));
    }
    getAllowances() {
        app.get("/api/get-all-allowances", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                logger_js_1.loggerServer.info(`get-all-allowances - Receive request from: ${req.ip}`);
                res.json(yield this.getAllAproval());
            }
            catch (error) {
                res.status(500).send("Error intern server delete");
            }
        }));
    }
    getAllowancesFromAddr() {
        app.get("/api/get-all-allowances-addr", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                logger_js_1.loggerServer.info(`get-all-allowances-addr - Receive request from`, req.ip);
                res.json(yield this.getAllowanceFromAddress(`${req.query.userAddress}`));
            }
            catch (error) {
                res.status(500).send("Error intern server delete");
            }
        }));
    }
    getApi() {
        logger_js_1.loggerServer.info("Starting api");
        this.deleteDatabase();
        this.getAllData();
        this.getAllLogsFromAddr();
        this.getTransactions();
        this.getTransactionsFromAddr();
        this.getAllowances();
        this.getAllowancesFromAddr();
    }
    parseStartingDb(array) {
        const obj = lodash_1.default.last(array);
        if (obj && obj.blocknumber !== undefined && this.contract) {
            this.contract.stopAt = BigInt(obj.blocknumber);
        }
        else {
            // Gérer le cas où obj?.blocknumber est undefined
        }
    }
    startFetchingLogs() {
        var _a;
        (_a = this.contract) === null || _a === void 0 ? void 0 : _a.startListener((logs) => {
            logger_js_1.loggerServer.trace("Receive logs: ", logs);
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.startApp();
                yield this.startBdd();
                this.getApi();
                const r = yield this.getData();
                this.parseStartingDb(r);
                // this.contract?.startListeningEvents();
                logger_js_1.loggerServer.trace("Connected to PostgreSQL database");
            }
            catch (error) {
                logger_js_1.loggerServer.error(error);
            }
        });
    }
}
exports.Server = Server;
