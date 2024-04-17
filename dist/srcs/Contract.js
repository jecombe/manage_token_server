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
const lodash_1 = __importDefault(require("lodash"));
const utils_js_1 = require("../utils/utils.js");
const abi_js_1 = __importDefault(require("../utils/abi.js"));
dotenv_1.default.config();
class Contract extends Viem_js_1.Viem {
    constructor(address, abi, manager) {
        super(address, abi);
        this.manager = manager;
        this.save = [];
        this.stopAt = BigInt(0);
        this.saveBlockNum = [];
        this.index = 0;
        this.isFetching = true;
        this.blockNumber = BigInt(0);
        this.timePerRequest = this.getRateLimits();
    }
    parseNumberToEth(number) {
        const numberBigInt = BigInt(number);
        return Number((0, viem_1.formatEther)(numberBigInt)).toFixed(2);
    }
    ;
    parseResult(logs) {
        return logs.reduce((accumulator, currentLog) => {
            let parsedLog = {
                eventName: currentLog.eventName,
                blockNumber: currentLog.blockNumber.toString(),
                value: 0,
                transactionHash: currentLog.transactionHash,
            };
            if (currentLog.eventName === "Transfer") {
                parsedLog.from = currentLog.args.from;
                parsedLog.to = currentLog.args.to;
                parsedLog.value = Number(this.parseNumberToEth(`${currentLog.args.value}`));
            }
            if (currentLog.eventName === "Approval") {
                parsedLog.from = currentLog.args.owner;
                parsedLog.to = currentLog.args.sender;
                parsedLog.value = Number(this.parseNumberToEth(`${currentLog.args.value}`));
            }
            accumulator.push(parsedLog);
            return accumulator;
        }, []);
    }
    sendData(parsed) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield Promise.all(parsed.map((el) => __awaiter(this, void 0, void 0, function* () {
                    yield this.manager.insertData(el);
                })));
            }
            catch (error) {
                logger_js_1.loggerServer.fatal("sendData: ", error);
                throw error;
            }
        });
    }
    /*async getEventLogs() {
        try {

            
            const batchSize = BigInt(3000);
            const saveLength = this.save.length;
            
            let fromBlock = this.blockNumber - batchSize * BigInt(this.index + 1);
            let toBlock = this.blockNumber - batchSize * BigInt(this.index);

            

            const batchLogs: any[] = await this.cliPublic.getLogs({
                address: `0x6A7577c10cD3F595eB2dbB71331D7Bf7223E1Aac`,
                events: parseAbi([
                    "event Approval(address indexed owner, address indexed sender, uint256 value)",
                    "event Transfer(address indexed from, address indexed to, uint256 value)",
                    // "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
                ]),
                fromBlock: fromBlock,
                toBlock: toBlock,
            });

            const parsed = this.parseResult(batchLogs);
            if (!_.isEmpty(parsed)) {
                console.log(parsed);
               // await this.sendData(parsed);
            }
            this.index++;

            if (this.index > 0) await waiting(2000);
            if (this.save.length > saveLength) return;

            return;

        } catch (error) {
            console.log(error);
            return error;
        }
    }*/
    isExist(array) {
        return array.reduce((acc, el) => {
            if (!(0, utils_js_1.existsBigIntInArray)(this.saveBlockNum, BigInt(el.blockNumber))) {
                acc.push(el);
            }
            return acc;
        }, []);
    }
    getEventsLogsFrom() {
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
                    ]),
                    fromBlock,
                    toBlock,
                });
                const parsed = this.parseResult(batchLogs);
                console.log(parsed);
                if (!lodash_1.default.isEmpty(parsed)) {
                    const checkExisting = this.isExist(parsed);
                    console.log("=====================================================00", checkExisting);
                    if (!lodash_1.default.isEmpty(checkExisting))
                        yield this.sendData(checkExisting);
                }
                this.index++;
                if (this.index > 0)
                    yield (0, utils_js_1.waiting)(2000);
                if (this.save.length > saveLength)
                    return;
                return;
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        });
    }
    /*async getEventLogs() {
        try {
            const batchSize = BigInt(3000);
            const saveLength = this.save.length;

            let fromBlock = this.blockNumber - batchSize * BigInt(this.index + 1);
            let toBlock = this.blockNumber - batchSize * BigInt(this.index);

            let stopAtBlock: bigint | undefined; // Déclarer une variable pour stocker le bloc à arrêter

            if (this.stopAt !== BigInt(0)) {
                stopAtBlock = BigInt(this.stopAt);
            }

            // Si stopAtBlock est défini et inférieur à toBlock, utilisez stopAtBlock comme toBlock
            if (stopAtBlock && stopAtBlock < toBlock) {
                toBlock = stopAtBlock;
            }

            // Descendez chaque bloc jusqu'à rencontrer le bloc stop
            while (toBlock >= fromBlock) {
                const batchLogs: any[] = await this.cliPublic.getLogs({
                    address: `0x6A7577c10cD3F595eB2dbB71331D7Bf7223E1Aac`,
                    events: parseAbi([
                        "event Approval(address indexed owner, address indexed sender, uint256 value)",
                        "event Transfer(address indexed from, address indexed to, uint256 value)",
                        // "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
                    ]),
                    fromBlock: fromBlock,
                    toBlock: toBlock,
                });
                console.log("FETCHING ");
                
                const parsed = this.parseResult(batchLogs);

                if (!_.isEmpty(parsed)) {
                    console.log(parsed);
                    await this.sendData(parsed);
                }
                this.index++;

                // Si l'index est supérieur à 0, attendez 2000 ms
                if (this.index > 0) await waiting(2000);
                if (this.save.length > saveLength) return;

                // Mise à jour de fromBlock et toBlock pour la prochaine itération
                fromBlock -= batchSize;
                toBlock -= batchSize;
            }

            return;

        } catch (error) {
            console.log(error);
            return error;
        }
    }*/
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
                logger_js_1.loggerServer.fatal("getLogsContract: ", error);
                throw error;
            }
        });
    }
    ;
    waitingRate(batchStartTime, timePerRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            const elapsedTime = Date.now() - batchStartTime;
            const waitTime = Math.max(0, timePerRequest - elapsedTime);
            return (0, utils_js_1.waiting)(waitTime);
        });
    }
    ;
    processLogsBatch() {
        return __awaiter(this, void 0, void 0, function* () {
            const batchStartTime = Date.now();
            try {
                yield this.getEventsLogsFrom();
                yield this.waitingRate(batchStartTime, this.timePerRequest);
            }
            catch (error) {
                logger_js_1.loggerServer.error(error);
                throw error;
            }
        });
    }
    ;
    startListener(callback) {
        logger_js_1.loggerServer.info("Listening Events smart contract...");
        return this.cliPublic.watchContractEvent({
            address: "0x6A7577c10cD3F595eB2dbB71331D7Bf7223E1Aac",
            abi: abi_js_1.default,
            onLogs: callback,
        });
    }
    startListeningEvents() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                //this.startListener();
                yield this.getLogsContract();
            }
            catch (error) {
                console.log(error);
            }
        });
    }
}
exports.Contract = Contract;
