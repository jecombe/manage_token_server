
import dotenv from "dotenv";
import { Chain, PublicClient, createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";

dotenv.config();

export class Viem {
    public cliPublic: PublicClient;

    constructor() {
        this.cliPublic = this.connectPublicClient();
    }

    connectPublicClient(): PublicClient {
        return createPublicClient({
            chain: sepolia as Chain,
            transport: http(),
        });
    }

    async getActualBlock(): Promise<bigint> {
        return this.cliPublic.getBlockNumber();
    }
}