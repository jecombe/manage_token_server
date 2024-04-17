
import dotenv from "dotenv";
import { Chain, PublicClient, createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { Abi } from 'abitype';

dotenv.config();

export class Viem {
    public addressContract: string;
    public abi: Abi;
    public cliPublic: PublicClient;

    constructor(address: string, abi: Abi) {

        this.addressContract = address;
        this.abi = abi;
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