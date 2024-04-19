
import dotenv from "dotenv";
import { Log, WatchContractEventReturnType, formatEther, parseAbi } from "viem";
import { loggerServer } from "../utils/logger.js";
import { Viem } from "./Viem.js";
import { Manager } from "./Manager.js";
import _ from "lodash";
import { existsBigIntInArray, parseTimestamp, removeTimeFromDate, subtractOneDay, waiting } from "../utils/utils.js";
import abi from "../utils/abi.js";
import { LogEntry, ParsedLog } from "../utils/interfaces.js";

dotenv.config();

export class Contract extends Viem {

    manager: Manager;
    index: number;
    blockNumber: bigint
    timePerRequest: number;
    isFetching: boolean;
    saveTx: string[];
    timeVolume: Date | null;
    saveTime: Date[];


    constructor(manager: Manager) {
        super();
        this.manager = manager;
        this.timeVolume = null;
        this.saveTx = [];
        this.saveTime = []
        this.index = 0;
        this.isFetching = true;
        this.blockNumber = BigInt(0);
        this.timePerRequest = this.getRateLimits();
    }
    async startAfterReset() {
        try {
            this.isFetching = true;
            await this.getLogsContract()
        } catch (error) {
            loggerServer.fatal("resetFetching: ", error)
            this.isFetching = false;
        }
    }

    async resetFetching() {

        this.isFetching = false;
        this.index = 0;
        this.saveTime = [];
        this.saveTx = [];

    }

    parseNumberToEth(number: string) {
        const numberBigInt: bigint = BigInt(number);
        return Number(formatEther(numberBigInt));
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
                console.log("PPPPPPPPPPPPPPPPPPPPPPPPPPPP> ",currentLog.args.value);
                
                parsedLog.from = currentLog.args.from;
                parsedLog.to = currentLog.args.to;
                parsedLog.value = this.parseNumberToEth(`${currentLog.args.value}`);
                parsedLog.transactionHash = currentLog.transactionHash;
            }

            else if (currentLog.eventName === "Approval" && currentLog.args.owner && currentLog.args.sender) {
                parsedLog.from = currentLog.args.owner;
                parsedLog.to = currentLog.args.sender;
                parsedLog.value = this.parseNumberToEth(`${currentLog.args.value}`);
                parsedLog.transactionHash = currentLog.transactionHash;
            }
            else loggerServer.info("Uknow envent come here: ", currentLog);

            accumulator.push(parsedLog);
            return accumulator;
        }, []);
    }

    async sendData(parsed: ParsedLog[], volume: number): Promise<void> {
        try {

            if (this.timeVolume && !_.includes(this.saveTime, this.timeVolume)) await this.manager.insertDataVolumes(this.timeVolume, volume)

            for (const el of parsed) {
                if (!_.includes(this.saveTx, el.transactionHash)) {
                   //await this.manager.insertDataVolumes()
                    await this.manager.insertDataLogs(el);
                    this.saveTx.push(el.transactionHash);
                }
            }
        } catch (error) {
            loggerServer.fatal("sendData: ", error);
            throw error;
        }
    }

    isExist(array: ParsedLog[]): ParsedLog[] {

        return array.reduce((acc: ParsedLog[], el: ParsedLog) => {
            if (!_.includes(this.saveTx, el.transactionHash)) {
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


    calculateVolume(logs: ParsedLog[]): string {
        let volume: bigint = BigInt(0);
        for (const log of logs) {
            if (log.eventName === 'Transfer') {
                volume += BigInt(log.value);
            }
        }
        return `${volume}`
    }

    async analyseVolume(checkExisting: ParsedLog[]) {
        //  console.log(checkExisting);
       console.log(this.calculateVolume(checkExisting));
        //console.log(parseInt(this.formatToEth(this.calculateVolume(checkExisting)), 18));
        //   console.log(Number(this.parseNumberToEth(this.calculateVolume(checkExisting))));

    }

    savingTx(parsed: ParsedLog[]) {
        parsed.map((el: ParsedLog) => {
            _.union(this.saveTx, el.transactionHash)
        })
    }

    async sendLogsWithCheck(parsed: ParsedLog[]): Promise<void> {
        try {

            if (!_.isEmpty(parsed)) {
     

                const checkExisting: ParsedLog[] = this.isExist(parsed);
                if (!_.isEmpty(checkExisting)) {

                    loggerServer.trace("Adding new thing: ", checkExisting, parsed, this.saveTx);
                
                    
                    const volumeDaily = this.calculateVolume(parsed);



                    console.log("Volume daily: => ", Number(volumeDaily));

                    await this.sendData(checkExisting, Number(volumeDaily));
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

            

            if (this.timeVolume) console.log("Date analyze: ", removeTimeFromDate(this?.timeVolume));

            if (!this.isFetching) return;

            const batchSize: bigint = BigInt(7200);

            //    const saveLength: number = this.save.length;

            const { fromBlock, toBlock } = this.getRangeBlock(batchSize);

            // loggerServer.trace(`From block: ${fromBlock} - To block: ${toBlock} - Index: ${this.index}`);

            const batchLogs: LogEntry[] = await this.getBatchLogs(fromBlock, toBlock);


            const parsed: ParsedLog[] = this.parseResult(batchLogs);

            await this.sendLogsWithCheck(parsed)

            this.index++;

            if (this.index > 0) await waiting(2000);

            /*  if (this.save.length > saveLength) {
                  loggerServer.debug("Ending while", this.save.length, saveLength)
                  return;
              }*/

            if (this.timeVolume) this.timeVolume = subtractOneDay(this.timeVolume);


            //  console.log("after: ", parseTimestamp(this.timeVolume));

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
            this.timeVolume = new Date();
            this.blockNumber = BigInt(await this.getActualBlock());

            while (this.isFetching) {
                await this.processLogsBatch();
            }
        } catch (error) {
            loggerServer.fatal("getLogsContract: ", error)
            this.isFetching = false;
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