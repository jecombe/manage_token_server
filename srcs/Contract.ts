
import dotenv from "dotenv";
import { formatEther, parseAbi } from "viem";
import { loggerServer } from "../utils/logger.js";
import { Viem } from "./Viem.js";
import { Manager } from "./Manager.js";
import _ from "lodash";
import { waiting } from "../utils/utils.js";

dotenv.config();

interface LogEntry {
    args: {
        from?: string;
        to?: string;
        value?: bigint; // Adapter le type de la valeur en fonction de ce que getLogs renvoie
        owner?: string; // Ajouter les propriétés manquantes si nécessaire
        sender?: string; // Ajouter les propriétés manquantes si nécessaire
    };
    eventName: string;
    blockNumber: bigint;
    transactionHash: string;
}

interface ParsedLog {
    eventName: string;
    from?: string;
    to?: string;
    owner?: string;
    sender?: string;
    blockNumber: string;
    value: number;
    transactionHash: string;
}


export class Contract extends Viem {

    unwatch: any | null;
    manager: Manager;
    save: ParsedLog[] = [];
    index: number;
    blockNumber: bigint
    timePerRequest: number;
    isFetching: boolean;


    constructor(address: string, abi: any[], manager: Manager) {
        super(address, abi);
        this.unwatch = null;
        this.manager = manager;
        this.save = [];
        this.index = 0;
        this.isFetching = true;
        this.blockNumber = BigInt(0);
        this.timePerRequest = this.getRateLimits();
        this.startListeningEvents();

    }

    parseNumberToEth(number: string) {
        const numberBigInt = BigInt(number); // Convertir la chaîne de caractères en bigint
        return Number(formatEther(numberBigInt)).toFixed(2);
    };

    parseResult(logs: LogEntry[]): ParsedLog[] {
        return logs.reduce((accumulator: ParsedLog[], currentLog: LogEntry) => {

            let parsedLog: ParsedLog = {
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
                parsedLog.owner = currentLog.args.owner;
                parsedLog.sender = currentLog.args.sender;
                parsedLog.value = Number(this.parseNumberToEth(`${currentLog.args.value}`));
            }

            accumulator.push(parsedLog);
            return accumulator;
        }, []);
    }

    async sendData(parsed: any[]) {
        await Promise.all(parsed.map(async (el: any) => {
            await this.manager.insertData(el.blockNumber, el.eventName, el.from, el.to, el.value);
        }));
    }

    async getEventLogs() {
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
    }


    getRateLimits() {
        const requestsPerMinute = 1800;
        const millisecondsPerMinute = 60000;
        return millisecondsPerMinute / requestsPerMinute;
    };

    async getLogsContract() {
        try {
            this.blockNumber = BigInt(await this.getActualBlock());

            while (this.isFetching) {
                await this.processLogsBatch();
            }
        } catch (error) {
            console.error(error);
        }
    };

    async waitingRate(batchStartTime: number, timePerRequest: number) {
        const elapsedTime = Date.now() - batchStartTime;
        const waitTime = Math.max(0, timePerRequest - elapsedTime);
        return waiting(waitTime);
    };


    async processLogsBatch() {
        const batchStartTime = Date.now();
        try {
            await this.getEventLogs();
            await this.waitingRate(batchStartTime, this.timePerRequest);
        } catch (error) {
            loggerServer.error(error);
        }

    };


    startListener() {
        loggerServer.info("Listening Events smart contract...");
        this.unwatch = this.cliPublic.watchEvent({
            onLogs: (logs: any) => loggerServer.trace(logs)
        })
    }



    async startListeningEvents() {
        try {
            //await this.getLogsContract();
            this.startListener();
        } catch (error) {
            console.log(error);
        }

    }
}