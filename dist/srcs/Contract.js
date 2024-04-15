"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contract = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const logger_js_1 = require("../utils/logger.js");
const Viem_js_1 = require("./Viem.js");
dotenv_1.default.config();
class Contract extends Viem_js_1.Viem {
    constructor(address, abi) {
        super(address, abi);
        this.unwatch = null;
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
    /*async getEventLogs(logSave, i, blockNumber) {
        try {
            const batchSize = BigInt(3000);

            const saveLength = logSave.length;

            let fromBlock = blockNumber - batchSize * BigInt(i + 1);
            let toBlock = blockNumber - batchSize * BigInt(i);

            const batchLogs = await ConnectPublicClient().getLogs({
                address: `0x${this.addressContract}`,
                events: parseAbi([
                    "event Approval(address indexed owner, address indexed sender, uint256 value)",
                    "event Transfer(address indexed from, address indexed to, uint256 value)",
                    "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
                ]),
                fromBlock: fromBlock,
                toBlock: toBlock,
            });
//            logSave = logSave.concat(thsparseResult(batchLogs));

            console.log(`Logs saved for request ${i + 1}:`, logSave.length, batchLogs);
            i++;

            if (i > 0) {
                await new Promise((resolve) => setTimeout(resolve, 2000));
            }

            if (logSave.length > saveLength) return { logSave, i, blockNumber };

            return { logSave, i, blockNumber };

        } catch (error) {
            return error;
        }
    }*/
    startListener() {
        logger_js_1.loggerServer.info("Listening Events smart contract...");
        console.log(this.cliPublic);
        //console.log(this.cli);
        // const cli = this.getContractApp();
        //  console.log(abi, address);
        this.unwatch = this.cliPublic.watchEvent({
            onLogs: (logs) => logger_js_1.loggerServer.trace(logs)
        });
    }
    startListeningEvents() {
        this.startListener();
    }
}
exports.Contract = Contract;
