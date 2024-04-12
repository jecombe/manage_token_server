import { createPublicClient, http } from "viem";
import { polygonMumbai, sepolia } from "viem/chains";

export function ConnectPublicClient() {
    return createPublicClient({
        chain: sepolia,
        transport: http(),
    });
}