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
exports.DataBase = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const pg_1 = require("pg");
const logger_js_1 = require("../utils/logger.js");
dotenv_1.default.config();
class DataBase {
    constructor() {
        this.pool = new pg_1.Pool({
            user: process.env.USR,
            password: process.env.PASSWORD,
            host: process.env.HOST,
            // port: process.env.PORT,
            database: process.env.DB
        });
        /* this.client = new Client({
             user: process.env.USR,
             password: process.env.PASSWORD,
             host: process.env.HOST,
            // port: process.env.PORT,
             database: process.env.DB
         })*/
    }
    deleteAllData() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                text: 'DELETE FROM contract_logs',
            };
            try {
                logger_js_1.loggerServer.trace('deleteAllData');
                yield this.pool.query(query);
            }
            catch (error) {
                logger_js_1.loggerServer.error('Error deleting data:', error);
                throw error;
            }
        });
    }
    getAllDataFromAddr(fromAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                text: "SELECT * FROM contract_logs WHERE fromAddress = $1",
                values: [fromAddress],
            };
            try {
                logger_js_1.loggerServer.trace('getAllDataFromAddr:', fromAddress);
                const result = yield this.pool.query(query);
                return result.rows;
            }
            catch (error) {
                logger_js_1.loggerServer.error('getAllDataFromAddr', error);
                throw error;
            }
        });
    }
    getData() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                text: 'SELECT * FROM contract_logs',
            };
            try {
                logger_js_1.loggerServer.trace('getData');
                const result = yield this.pool.query(query);
                return result.rows;
            }
            catch (error) {
                logger_js_1.loggerServer.error('getData:', error);
                throw error;
            }
        });
    }
    getAllTx() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                text: "SELECT * FROM contract_logs WHERE eventName='Transfer'"
            };
            try {
                logger_js_1.loggerServer.trace('getAllTx');
                const result = yield this.pool.query(query);
                return result.rows;
            }
            catch (error) {
                logger_js_1.loggerServer.error('getAllTx:', error);
                throw error;
            }
        });
    }
    getTransfersFromAddress(fromAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                text: "SELECT * FROM contract_logs WHERE eventName = 'Transfer' AND fromAddress = $1",
                values: [fromAddress],
            };
            try {
                logger_js_1.loggerServer.trace('getTransfersFromAddress:', fromAddress);
                const result = yield this.pool.query(query);
                return result.rows;
            }
            catch (error) {
                logger_js_1.loggerServer.fatal('getTransfersFromAddress:', error);
                throw error;
            }
        });
    }
    getAllowanceFromAddress(fromAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                text: "SELECT * FROM contract_logs WHERE eventName = 'Allowance' AND fromAddress = $1",
                values: [fromAddress],
            };
            try {
                logger_js_1.loggerServer.trace('getAllowanceFromAddress:', fromAddress);
                const result = yield this.pool.query(query);
                return result.rows;
            }
            catch (error) {
                logger_js_1.loggerServer.fatal('getAllowanceFromAddress:', error);
                throw error;
            }
        });
    }
    getAllAproval() {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                text: "SELECT * FROM contract_logs WHERE eventName='Approval'"
            };
            try {
                logger_js_1.loggerServer.trace('getAllAproval');
                const result = yield this.pool.query(query);
                return result.rows;
            }
            catch (error) {
                logger_js_1.loggerServer.error('getAllAproval:', error);
                throw error;
            }
        });
    }
    insertData(parsedLog) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                text: 'INSERT INTO contract_logs (blockNumber, eventName, fromAddress, toAddress, value) VALUES ($1, $2, $3, $4, $5)',
                values: [parsedLog.blockNumber, parsedLog.eventName, parsedLog.from, parsedLog.to, parsedLog.value],
            };
            try {
                logger_js_1.loggerServer.trace('Data insert wating...');
                yield this.pool.query(query);
                logger_js_1.loggerServer.info('Data inserted successfully');
            }
            catch (error) {
                logger_js_1.loggerServer.error('Error inserting data:', error);
                throw error;
            }
        });
    }
    startBdd() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.pool.connect();
                logger_js_1.loggerServer.info("Postgres is connected");
            }
            catch (error) {
                logger_js_1.loggerServer.fatal("startBdd: ", error);
                throw error;
            }
        });
    }
}
exports.DataBase = DataBase;
