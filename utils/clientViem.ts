import { Chain, PublicClient, Transport, createPublicClient, getContract, http } from "viem";
import {  sepolia } from "viem/chains";

export const ConnectPublicClient = (): PublicClient => {
    return createPublicClient({
        chain: sepolia as Chain,
        transport: http(),
    });
}

export const getContractApp = (publicClient: PublicClient, address: string, abi: any) => {
    return getContract({
        address: "0x6A7577c10cD3F595eB2dbB71331D7Bf7223E1Aac",
        abi,
        client: {
          public: publicClient,
        },
    })
}