"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const pg_1 = __importStar(require("pg"));
const logger_js_1 = require("../utils/logger.js");
const { Client } = pg_1.default;
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
                logger_js_1.loggerServer.trace('All data are delete waiting...');
                yield this.pool.query(query);
                logger_js_1.loggerServer.info('All data deleted successfully');
            }
            catch (error) {
                logger_js_1.loggerServer.error('Error deleting data:', error);
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
                logger_js_1.loggerServer.trace('Querying database for all data from address:', fromAddress);
                const result = yield this.pool.query(query);
                logger_js_1.loggerServer.info(`All transfer all data from address ${fromAddress} retrieved successfully`);
                return result.rows;
            }
            catch (error) {
                logger_js_1.loggerServer.error('Error querying data:', error);
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
                logger_js_1.loggerServer.trace('Fetching data...');
                const result = yield this.pool.query(query);
                logger_js_1.loggerServer.info('Data fetched successfully');
                return result.rows;
            }
            catch (error) {
                logger_js_1.loggerServer.error('Error fetching data:', error);
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
                logger_js_1.loggerServer.trace('get data');
                const result = yield this.pool.query(query);
                return result.rows;
            }
            catch (error) {
                logger_js_1.loggerServer.error('Error inserting data:', error);
                return error;
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
                logger_js_1.loggerServer.trace('Querying database for transfers from address:', fromAddress);
                const result = yield this.pool.query(query);
                logger_js_1.loggerServer.info(`All transfer transactions from address ${fromAddress} retrieved successfully`);
                return result.rows;
            }
            catch (error) {
                logger_js_1.loggerServer.error('Error querying data:', error);
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
                logger_js_1.loggerServer.trace('Querying database for allowances from address:', fromAddress);
                const result = yield this.pool.query(query);
                logger_js_1.loggerServer.info(`All transfer transactions from address ${fromAddress} retrieved successfully`);
                return result.rows;
            }
            catch (error) {
                logger_js_1.loggerServer.error('Error querying data:', error);
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
                logger_js_1.loggerServer.trace('get data');
                const result = yield this.pool.query(query);
                return result.rows;
            }
            catch (error) {
                logger_js_1.loggerServer.error('Error inserting data:', error);
                return error;
            }
        });
    }
    insertData(blockNumber, eventName, fromAddress, toAddress, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = {
                text: 'INSERT INTO contract_logs (blockNumber, eventName, fromAddress, toAddress, value) VALUES ($1, $2, $3, $4, $5)',
                values: [blockNumber, eventName, fromAddress, toAddress, value],
            };
            try {
                logger_js_1.loggerServer.trace('Data insert wating...');
                yield this.pool.query(query);
                logger_js_1.loggerServer.info('Data inserted successfully');
            }
            catch (error) {
                logger_js_1.loggerServer.error('Error inserting data:', error);
                return error;
            }
        });
    }
    startBdd() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.pool.connect();
        });
    }
    addLogs() {
        console.log("Add Logs DATABASE");
        //this.insertData(0, "eventName", "fromAddress", "toAddress", 1)
        this.getData();
    }
}
exports.DataBase = DataBase;
