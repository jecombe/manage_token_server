import { loggerServer } from "../utils/logger";
import dotenv from "dotenv";
import { Contract } from "./Contract";
import abi from "../utils/abi";
import { Server } from "./Server";

dotenv.config();


export class Manager extends Server {
    public contract: Contract;

    constructor() {
        super();
        this.contract = new Contract(`${process.env.CONTRACT}`, abi, this);
    }

  

    /*async insertNewValue(): Promise<void> {
        try {
            await this.db.insertData(1, "event", "OXXXXXXXXXXXX", "OYYYYYYYYYYYYYYYYY", 12);
            loggerServer.info("Data insert succeed");
        } catch (error) {
            loggerServer.error("Error inserting data:", error);
        }
    }*/

    async startServer(): Promise<void> {
        try {
            await this.start();
          //  this.contract.startListeningEvents();
        } catch (error) {
            loggerServer.fatal("StartServer: ", error);
        }
    }

    async test(): Promise<void> {
        // Votre logique de test
    }
}
