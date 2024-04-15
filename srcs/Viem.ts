
import dotenv from "dotenv";
import { ConnectPublicClient } from "../utils/clientViem.js";
import { Chain, PublicClient, createPublicClient, http } from "viem";
import {  sepolia } from "viem/chains";
dotenv.config();



export class Viem {
    public addressContract: string;
    public abi: any[];
    public cli: any;
    public cliPublic: PublicClient;

    constructor(address: string, abi: any[]) {

        this.addressContract = address;
        this.abi = abi;
        this.cliPublic = this.getContractApp();
        
        //this.cli = this.getContractApp()
    }

    ConnectPublicClient(): PublicClient {
        return createPublicClient({
            chain: sepolia as Chain,
            transport: http(),
        });
    }

    async getActualBlock(): Promise<bigint> {
        return this.cliPublic.getBlockNumber();

    }


    getContractApp(): PublicClient{
       return this.ConnectPublicClient();
        
        /*return getContract({
            address: `0x6A7577c10cD3F595eB2dbB71331D7Bf7223E1Aac`,
            abi: this.abi,
            client: {
              public: publicClient,
            },
        })*/
    }



    startListeningEvents() {
        //this.startListener();
    }
}