"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Viem = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
dotenv_1.default.config();
class Viem {
    constructor(address, abi) {
        this.addressContract = address;
        this.abi = abi;
        this.cliPublic = this.getContractApp();
        //this.cli = this.getContractApp()
    }
    ConnectPublicClient() {
        return (0, viem_1.createPublicClient)({
            chain: chains_1.sepolia,
            transport: (0, viem_1.http)(),
        });
    }
    getActualBlock() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.cliPublic.getBlockNumber();
        });
    }
    getContractApp() {
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
exports.Viem = Viem;
