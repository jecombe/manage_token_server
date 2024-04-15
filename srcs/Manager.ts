import { loggerServer } from "../utils/logger";
import dotenv from "dotenv";
import { Contract } from "./Contract";
import abi from "../utils/abi";
import { Server } from "./Server";

dotenv.config();


export class Manager extends Server {

    constructor() {
        super()
        this.setManager(this);
    }

    async startServer(): Promise<void> {
        try {
            await this.start();
           //this.contract.startListeningEvents();
        } catch (error) {
            loggerServer.fatal("StartServer: ", error);
        }
    }

    addData() {
        console.log("MANAGER");
        
        this.addLogs()
    }
    

    async test(): Promise<void> {
        // Votre logique de test
    }
}
