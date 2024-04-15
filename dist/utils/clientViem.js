"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContractApp = exports.ConnectPublicClient = void 0;
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
const ConnectPublicClient = () => {
    return (0, viem_1.createPublicClient)({
        chain: chains_1.sepolia,
        transport: (0, viem_1.http)(),
    });
};
exports.ConnectPublicClient = ConnectPublicClient;
const getContractApp = (publicClient, address, abi) => {
    return (0, viem_1.getContract)({
        address: "0x6A7577c10cD3F595eB2dbB71331D7Bf7223E1Aac",
        abi,
        client: {
            public: publicClient,
        },
    });
};
exports.getContractApp = getContractApp;
