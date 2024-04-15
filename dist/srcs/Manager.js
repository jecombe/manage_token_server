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
exports.Manager = void 0;
const logger_1 = require("../utils/logger");
const dotenv_1 = __importDefault(require("dotenv"));
const Contract_1 = require("./Contract");
const abi_1 = __importDefault(require("../utils/abi"));
const Server_1 = require("./Server");
dotenv_1.default.config();
class Manager extends Server_1.Server {
    constructor() {
        super();
        this.contract = new Contract_1.Contract(`${process.env.CONTRACT}`, abi_1.default, this);
    }
    /*async insertNewValue(): Promise<void> {
        try {
            await this.db.insertData(1, "event", "OXXXXXXXXXXXX", "OYYYYYYYYYYYYYYYYY", 12);
            loggerServer.info("Data insert succeed");
        } catch (error) {
            loggerServer.error("Error inserting data:", error);
        }
    }*/
    startServer() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.start();
                //  this.contract.startListeningEvents();
            }
            catch (error) {
                logger_1.loggerServer.fatal("StartServer: ", error);
            }
        });
    }
    test() {
        return __awaiter(this, void 0, void 0, function* () {
            // Votre logique de test
        });
    }
}
exports.Manager = Manager;
