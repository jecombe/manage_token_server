
import dotenv from "dotenv";

import { Pool, PoolClient, QueryResult } from 'pg';
import { loggerServer } from "../utils/logger.js";
import _ from "lodash"
import { ParsedLog, ResultBdd } from "../utils/interfaces.js";

dotenv.config();




export class DataBase {

    public pool: Pool;

    constructor() {
        this.pool = new Pool({
            user: process.env.USR,
            password: process.env.PASSWORD,
            host: process.env.HOST,
            // port: process.env.PORT,
            database: process.env.DB
        });


        /* this.client = new Client({
             user: process.env.USR,
             password: process.env.PASSWORD,
             host: process.env.HOST,
            // port: process.env.PORT,
             database: process.env.DB
         })*/
    }

    async deleteAllData(): Promise<void> {
        const query = {
            text: 'DELETE FROM contract_logs',
        };
        try {
            loggerServer.trace('All data are delete waiting...');
            await this.pool.query(query);
            loggerServer.info('All data deleted successfully');
        } catch (error) {
            loggerServer.error('Error deleting data:', error);
        }
    }

    async getAllDataFromAddr(fromAddress: string): Promise<ResultBdd[]> {
        const query = {
            text: "SELECT * FROM contract_logs WHERE fromAddress = $1",
            values: [fromAddress],
        };
        try {
            loggerServer.trace('Querying database for all data from address:', fromAddress);
            const result: QueryResult = await this.pool.query(query);
            loggerServer.info(`All transfer all data from address ${fromAddress} retrieved successfully`);
            return result.rows;
        } catch (error) {
            loggerServer.error('Error querying data:', error);
            throw error;
        }
    }

    async getData(): Promise<ResultBdd[]> {
        const query = {
            text: 'SELECT * FROM contract_logs',
        };
        try {
            loggerServer.trace('Fetching data...');
            const result: QueryResult = await this.pool.query(query);
            loggerServer.info('Data fetched successfully');
            return result.rows;
        } catch (error) {
            loggerServer.error('Error fetching data:', error);
            throw error;
        }
    }

    async getAllTx(): Promise<ResultBdd[]> {
        const query = {
            text: "SELECT * FROM contract_logs WHERE eventName='Transfer'"
        };
        try {
            loggerServer.trace('get data');
            const result: QueryResult = await this.pool.query(query);
            return result.rows;
        } catch (error) {
            loggerServer.error('Error inserting data:', error);
            throw error;
        }
    }

    async getTransfersFromAddress(fromAddress: string): Promise<ResultBdd[]> {
        const query = {
            text: "SELECT * FROM contract_logs WHERE eventName = 'Transfer' AND fromAddress = $1",
            values: [fromAddress],
        };
        try {
            loggerServer.trace('Querying database for transfers from address:', fromAddress);
            const result: QueryResult = await this.pool.query(query);
            loggerServer.info(`All transfer transactions from address ${fromAddress} retrieved successfully`);
            return result.rows;
        } catch (error) {
            loggerServer.error('Error querying data:', error);
            throw error;
        }
    }

    async getAllowanceFromAddress(fromAddress: string): Promise<ResultBdd[]> {
        const query = {
            text: "SELECT * FROM contract_logs WHERE eventName = 'Allowance' AND fromAddress = $1",
            values: [fromAddress],
        };
        try {
            loggerServer.trace('Querying database for allowances from address:', fromAddress);
            const result: QueryResult = await this.pool.query(query);
            loggerServer.info(`All transfer transactions from address ${fromAddress} retrieved successfully`);
            return result.rows;
        } catch (error) {
            loggerServer.error('Error querying data:', error);
            throw error;
        }
    }


    async getAllAproval(): Promise<ResultBdd[]> {
        const query = {
            text: "SELECT * FROM contract_logs WHERE eventName='Approval'"
        };
        try {
            loggerServer.trace('get data');
            const result: QueryResult = await this.pool.query(query);
            return result.rows;
        } catch (error) {
            loggerServer.error('Error inserting data:', error);
            throw error;
        }
    }





    async insertData(parsedLog: ParsedLog): Promise<void> {
        const query = {
            text: 'INSERT INTO contract_logs (blockNumber, eventName, fromAddress, toAddress, value) VALUES ($1, $2, $3, $4, $5)',
            values: [parsedLog.blockNumber, parsedLog.eventName, parsedLog.from, parsedLog.to, parsedLog.value],
        };
        try {
            loggerServer.trace('Data insert wating...');
            await this.pool.query(query);
            loggerServer.info('Data inserted successfully');
        } catch (error) {
            loggerServer.error('Error inserting data:', error);
            throw error;
        }
    }

    async startBdd(): Promise<void> {
        try {
            await this.pool.connect();
            loggerServer.info("Postgres is connected")
        } catch (error) {
            throw error;
        }
    }

}