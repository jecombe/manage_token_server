
import dotenv from "dotenv";
import { ConnectPublicClient, getContractApp } from "../utils/clientViem.js";
import { Chain, Client, PublicClient, Transport, getContract, parseAbi } from "viem";
import { loggerServer } from "../utils/logger.js";
import { Viem } from "./Viem.js";

dotenv.config();



export class Contract extends Viem {

    unwatch: any | null;

    constructor(address: string, abi: any[]) {
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
        loggerServer.info("Listening Events smart contract...");
        this.unwatch =  this.cliPublic.watchEvent({
            onLogs: (logs: any) => loggerServer.trace(logs)
        })
    }


    startListeningEvents() {
        this.startListener();
    }
}