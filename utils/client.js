import { createPublicClient, http } from "viem";
import { polygonMumbai } from "viem/chains";

export function ConnectPublicClient() {
    return createPublicClient({
        chain: polygonMumbai,
        transport: http(),
    });
}