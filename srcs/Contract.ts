
import dotenv from "dotenv";
import { GetLogsReturnType, Log, WatchContractEventReturnType, formatEther, parseAbi } from "viem";
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
    public blockNumber: bigint
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
        const numberBigInt = BigInt(number);
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
                parsedLog.from = currentLog.args.owner;
                parsedLog.to = currentLog.args.sender;
                parsedLog.value = Number(this.parseNumberToEth(`${currentLog.args.value}`));
            }

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

    isExist(array: ParsedLog[]): ParsedLog[] {

        return array.reduce((acc: ParsedLog[], el: ParsedLog) => {
            if (!existsBigIntInArray(this.saveBlockNum, BigInt(el.blockNumber))) {
                acc.push(el)
            }
            return acc;
        }, [])
    }

    async getEventsLogsFrom(): Promise<void> {
        try {
            const batchSize = BigInt(3000);
            const saveLength = this.save.length;

            let fromBlock = this.blockNumber - batchSize * BigInt(this.index + 1);
            let toBlock = this.blockNumber - batchSize * BigInt(this.index);

            loggerServer.trace(`From block: ${fromBlock} - To block: ${toBlock} - Index: ${this.index}`);

            const batchLogs: LogEntry[] = await this.cliPublic.getLogs({
                address: `0x6A7577c10cD3F595eB2dbB71331D7Bf7223E1Aac`,
                events: parseAbi([
                    "event Approval(address indexed owner, address indexed sender, uint256 value)",
                    "event Transfer(address indexed from, address indexed to, uint256 value)",
                ]),
                fromBlock,
                toBlock,
            });

            const parsed: ParsedLog[] = this.parseResult(batchLogs);

            if (!_.isEmpty(parsed)) {
                const checkExisting: ParsedLog[] = this.isExist(parsed);
                if (!_.isEmpty(checkExisting)) {
                    loggerServer.trace("Adding new thing: ", checkExisting);
                    await this.sendData(checkExisting);
                } else {
                    loggerServer.error("Log already existe", parsed)
                }
            }

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

    getRateLimits(): number {
        const requestsPerMinute = 1800;
        const millisecondsPerMinute = 60000;
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
        const elapsedTime = Date.now() - batchStartTime;
        const waitTime = Math.max(0, timePerRequest - elapsedTime);
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
            address: "0x6A7577c10cD3F595eB2dbB71331D7Bf7223E1Aac",
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