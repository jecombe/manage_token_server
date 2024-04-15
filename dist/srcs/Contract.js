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
exports.Contract = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const viem_1 = require("viem");
const logger_js_1 = require("../utils/logger.js");
const Viem_js_1 = require("./Viem.js");
dotenv_1.default.config();
class Contract extends Viem_js_1.Viem {
    constructor(address, abi, manager) {
        super(address, abi);
        this.save = [];
        this.unwatch = null;
        this.manager = manager;
        this.save = [];
        this.index = 0;
        this.isFetching = true;
        this.blockNumber = BigInt(0);
        this.timePerRequest = this.getRateLimits();
        this.startListeningEvents();
    }
    /*parseResult(logs) {
        return logs.reduce((accumulator, currentLog) => {
            const { args, eventName, blockNumber, transactionHash } = currentLog;

            let parsedLog = {};

            if (eventName === "Transfer") {
                parsedLog = {
                    eventName: "transfer",
                    from: args.from,
                    to: args.to,
                    blockNumber: blockNumber.toString(),
                    value: parseNumberToEth(args.value),
                    transactionHash,
                };
                accumulator.push(parsedLog);
            }

            if (eventName === "Approval") {
                parsedLog = {
                    eventName: "approval",
                    blockNumber: blockNumber.toString(),
                    owner: args.owner,
                    sender: args.sender,
                    value: parseNumberToEth(args.value),
                    transactionHash,
                };
                accumulator.push(parsedLog);
            }
            return accumulator;
        }, []);
    };*/
    parseNumberToEth(number) {
        const numberBigInt = BigInt(number); // Convertir la chaîne de caractères en bigint
        return Number((0, viem_1.formatEther)(numberBigInt)).toFixed(2);
    }
    ;
    parseResult(logs) {
        return logs.reduce((accumulator, currentLog) => {
            let parsedLog = {
                eventName: currentLog.eventName,
                blockNumber: currentLog.blockNumber.toString(),
                value: 0, // Valeur par défaut, vous pouvez l'initialiser avec une autre valeur si nécessaire
                transactionHash: currentLog.transactionHash,
            };
            if (currentLog.eventName === "Transfer") {
                parsedLog.from = currentLog.args.from;
                parsedLog.to = currentLog.args.to;
                parsedLog.value = 0; //Number(this.parseNumberToEth(currentLog.args.value));
            }
            if (currentLog.eventName === "Approval") {
                parsedLog.owner = currentLog.args.owner;
                parsedLog.sender = currentLog.args.sender;
                parsedLog.value = 0; //Number(this.parseNumberToEth(currentLog.args.value));
            }
            accumulator.push(parsedLog);
            return accumulator;
        }, []);
    }
    getEventLogs() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const batchSize = BigInt(3000);
                const saveLength = this.save.length;
                let fromBlock = this.blockNumber - batchSize * BigInt(this.index + 1);
                let toBlock = this.blockNumber - batchSize * BigInt(this.index);
                const batchLogs = yield this.cliPublic.getLogs({
                    address: `0x6A7577c10cD3F595eB2dbB71331D7Bf7223E1Aac`,
                    events: (0, viem_1.parseAbi)([
                        "event Approval(address indexed owner, address indexed sender, uint256 value)",
                        "event Transfer(address indexed from, address indexed to, uint256 value)",
                        "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
                    ]),
                    fromBlock: fromBlock,
                    toBlock: toBlock,
                });
                this.save = this.save.concat(this.parseResult(batchLogs));
                // console.log(`Logs saved for request ${this.index + 1}:`, this.save.length);
                this.index++;
                if (this.index > 0) {
                    yield new Promise((resolve) => setTimeout(resolve, 2000));
                }
                if (this.save.length > saveLength)
                    return 0; //return { logSave, i, blockNumber };
                return 0;
            }
            catch (error) {
                console.log(error);
                return error;
            }
        });
    }
    getRateLimits() {
        const requestsPerMinute = 1800;
        const millisecondsPerMinute = 60000;
        return millisecondsPerMinute / requestsPerMinute;
    }
    ;
    getLogsContract() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.blockNumber = BigInt(yield this.getActualBlock());
                while (this.isFetching) {
                    yield this.processLogsBatch();
                }
            }
            catch (error) {
                console.error(error);
            }
        });
    }
    ;
    waitingRate(batchStartTime, timePerRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            const elapsedTime = Date.now() - batchStartTime;
            const waitTime = Math.max(0, timePerRequest - elapsedTime);
            return new Promise((resolve) => setTimeout(resolve, waitTime));
        });
    }
    ;
    processLogsBatch() {
        return __awaiter(this, void 0, void 0, function* () {
            const batchStartTime = Date.now();
            yield this.getEventLogs();
            yield this.waitingRate(batchStartTime, this.timePerRequest);
        });
    }
    ;
    startListener() {
        logger_js_1.loggerServer.info("Listening Events smart contract...");
        this.unwatch = this.cliPublic.watchEvent({
            onLogs: (logs) => logger_js_1.loggerServer.trace(logs)
        });
    }
    startListeningEvents() {
        this.getLogsContract();
        //  this.startListener();
    }
}
exports.Contract = Contract;
