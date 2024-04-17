
import dotenv from "dotenv";
import { Log, WatchContractEventReturnType, formatEther, parseAbi } from "viem";
import { loggerServer } from "../utils/logger.js";
import { Viem } from "./Viem.js";
import { Manager } from "./Manager.js";
import _ from "lodash";
import { existsBigIntInArray, waiting } from "../utils/utils.js";
import abi from "../utils/abi.js";
import { Abi } from 'abitype'
import { LogEntry, ParsedLog } from "../utils/interfaces.js";

dotenv.config();

export class Contract extends Viem {

    manager: Manager;
    save: ParsedLog[];
    index: number;
    blockNumber: bigint
    timePerRequest: number;
    isFetching: boolean;
    stopAt: bigint
    saveBlockNum: bigint[];


    constructor(address: string, abi: Abi, manager: Manager) {
        super(address, abi);
        this.manager = manager;
        this.save = [];
        this.stopAt = BigInt(0);
        this.saveBlockNum = []
        this.index = 0;
        this.isFetching = true;
        this.blockNumber = BigInt(0);
        this.timePerRequest = this.getRateLimits();
    }

    parseNumberToEth(number: string) {
        const numberBigInt: bigint = BigInt(number);
        return Number(formatEther(numberBigInt)).toFixed(2);
    };


    initParsingLog(currentLog: LogEntry): ParsedLog {
        return {
            eventName: currentLog.eventName,
            from: "",
            to: "",
            blockNumber: currentLog.blockNumber.toString(),
            value: 0,
            transactionHash: currentLog.transactionHash,
        };
    }
    
    parseResult(logs: LogEntry[]): ParsedLog[] {
        return logs.reduce((accumulator: ParsedLog[], currentLog: LogEntry) => {

            const parsedLog: ParsedLog = this.initParsingLog(currentLog);

            if (currentLog.eventName === "Transfer" && currentLog.args.from && currentLog.args.to) {
                parsedLog.from = currentLog.args.from;
                parsedLog.to = currentLog.args.to;
                parsedLog.value = Number(this.parseNumberToEth(`${currentLog.args.value}`));
            }

            else if (currentLog.eventName === "Approval" && currentLog.args.owner && currentLog.args.sender) {
                parsedLog.from = currentLog.args.owner;
                parsedLog.to = currentLog.args.sender;
                parsedLog.value = Number(this.parseNumberToEth(`${currentLog.args.value}`));
            }
            else loggerServer.info("Uknow envent come here: ", currentLog);

            accumulator.push(parsedLog);
            return accumulator;
        }, []);
    }

    async sendData(parsed: ParsedLog[]): Promise<void> {
        try {
            await Promise.all(parsed.map(async (el: ParsedLog) => {
                await this.manager.insertData(el);
            }));
        } catch (error) {
            loggerServer.fatal("sendData: ", error);
            throw error;
        }
    }

    isExist(array: ParsedLog[]): ParsedLog[] {

        return array.reduce((acc: ParsedLog[], el: ParsedLog) => {
            if (!existsBigIntInArray(this.saveBlockNum, BigInt(el.blockNumber))) {
                acc.push(el)
            }
            return acc;
        }, [])
    }

    getRangeBlock(batchSize: bigint): { fromBlock: bigint; toBlock: bigint } {
        const fromBlock: bigint = this.blockNumber - batchSize * BigInt(this.index + 1);
        const toBlock: bigint = this.blockNumber - batchSize * BigInt(this.index);
        return { fromBlock, toBlock };
    }

    async getBatchLogs(fromBlock: bigint, toBlock: bigint): Promise<LogEntry[]> {
        return this.cliPublic.getLogs({
            address: `0x${process.env.CONTRACT}`,
            events: parseAbi([
                "event Approval(address indexed owner, address indexed sender, uint256 value)",
                "event Transfer(address indexed from, address indexed to, uint256 value)",
            ]),
            fromBlock,
            toBlock,
        });
    }

    async sendLogsWithCheck(parsed: ParsedLog[]): Promise<void> {
        try {

            if (!_.isEmpty(parsed)) {
                const checkExisting: ParsedLog[] = this.isExist(parsed);
                if (!_.isEmpty(checkExisting)) {
                    loggerServer.trace("Adding new thing: ", checkExisting);
                    await this.sendData(checkExisting);
                } else {
                    loggerServer.error("Log already existe", parsed)
                }
            }

        } catch (error) {
            loggerServer.fatal("sendLogsWithCheck", error);
            throw error;
        }
    }

    async getEventsLogsFrom(): Promise<void> {
        try {
            const batchSize: bigint = BigInt(3000);
            const saveLength: number = this.save.length;

            const { fromBlock, toBlock } = this.getRangeBlock(batchSize);

            loggerServer.trace(`From block: ${fromBlock} - To block: ${toBlock} - Index: ${this.index}`);

            const batchLogs: LogEntry[] = await this.getBatchLogs(fromBlock, toBlock);

            const parsed: ParsedLog[] = this.parseResult(batchLogs);

            await this.sendLogsWithCheck(parsed)

            this.index++;

            if (this.index > 0) await waiting(2000);

            if (this.save.length > saveLength) {
                loggerServer.debug("Ending while", this.save.length, saveLength)
                return;
            }

            return;
        } catch (error) {
            loggerServer.fatal("getEventsLogsFrom: ", error)
            throw error;
        }
    }

    getRateLimits(): number {
        const requestsPerMinute: number = 1800;
        const millisecondsPerMinute: number = 60000;
        return millisecondsPerMinute / requestsPerMinute;
    };

    async getLogsContract(): Promise<void> {
        try {
            this.blockNumber = BigInt(await this.getActualBlock());

            while (this.isFetching) {
                await this.processLogsBatch();
            }
        } catch (error) {
            loggerServer.fatal("getLogsContract: ", error)
            throw error;
        }
    };

    async waitingRate(batchStartTime: number, timePerRequest: number): Promise<void> {
        const elapsedTime: number = Date.now() - batchStartTime;
        const waitTime: number = Math.max(0, timePerRequest - elapsedTime);
        return waiting(waitTime);
    };


    async processLogsBatch(): Promise<void> {
        const batchStartTime: number = Date.now();
        try {
            await this.getEventsLogsFrom();
            await this.waitingRate(batchStartTime, this.timePerRequest);
        } catch (error) {
            loggerServer.error("processLogsBatch: ", error);
            throw error;
        }

    };


    startListener(callback: (logs: Log[]) => void): WatchContractEventReturnType {
        loggerServer.info("Listening Events smart contract...");
        return this.cliPublic.watchContractEvent({
            address: `0x${process.env.CONTRACT}`,
            abi,
            onLogs: callback,
        });
    }

    async startListeningEvents(): Promise<void> {
        try {
            //this.startListener();
            await this.getLogsContract();
        } catch (error) {
            loggerServer.fatal("startListeningEvents: ", error)
            throw error;
        }

    }
}