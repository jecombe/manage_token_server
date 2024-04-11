
import dotenv from "dotenv";
import { ConnectPublicClient } from "../utils/client";
import { getContract, parseAbi } from "viem";

dotenv.config();

export class Contract {
    constructor() { }

    getContractInfo() {
        return getContract({
            address: process.env.CONTRACT,
            abi,
            publicClient: ConnectPublicClient(),
            // walletClient: ConnectWalletClient(),
        });
    };

    async getEventLogs(logSave, i, blockNumber) {
        try {
            const batchSize = BigInt(3000);

            const saveLength = logSave.length;

            let fromBlock = blockNumber - batchSize * BigInt(i + 1);
            let toBlock = blockNumber - batchSize * BigInt(i);

            const batchLogs = await ConnectPublicClient().getLogs({
                address: process.env.CONTRACT,
                events: parseAbi([
                    "event Approval(address indexed owner, address indexed sender, uint256 value)",
                    "event Transfer(address indexed from, address indexed to, uint256 value)",
                    "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
                ]),
                fromBlock: fromBlock,
                toBlock: toBlock,
            });
            logSave = logSave.concat(parseResult(batchLogs));

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
    }
}