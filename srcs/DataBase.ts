
import dotenv from "dotenv";

import pkg, { Pool } from 'pg';
import { loggerServer } from "../utils/logger.js";
const { Client } = pkg;

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

    async deleteAllData() {
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

    async getData() {
        const query = {
            text: 'SELECT * FROM contract_logs',
        };
        try {
            loggerServer.trace('Fetching data...');
            const result = await this.pool.query(query);
            loggerServer.info('Data fetched successfully');
            return result.rows;
        } catch (error) {
            loggerServer.error('Error fetching data:', error);
            throw error;
        }
    }

    async getAllTx() {
        const query = {
            text: "SELECT * FROM contract_logs WHERE eventName='Transfer'"
        };
        try {
            loggerServer.trace('get data');
            const result = await this.pool.query(query);
            return result.rows;
        } catch (error) {
            loggerServer.error('Error inserting data:', error);
            return error;
        }
    }

    async getTransfersFromAddress(fromAddress: string) {
        const query = {
            text: "SELECT * FROM contract_logs WHERE eventName = 'Transfer' AND fromAddress = $1",
            values: [fromAddress],
        };
        try {
            loggerServer.trace('Querying database for transfers from address:', fromAddress);
            const result = await this.pool.query(query);
            loggerServer.info(`All transfer transactions from address ${fromAddress} retrieved successfully`);
            return result.rows;
        } catch (error) {
            loggerServer.error('Error querying data:', error);
            throw error;
        }
    }

    async getAllowanceFromAddress(fromAddress: string) {
        const query = {
            text: "SELECT * FROM contract_logs WHERE eventName = 'Allowance' AND fromAddress = $1",
            values: [fromAddress],
        };
        try {
            loggerServer.trace('Querying database for allowances from address:', fromAddress);
            const result = await this.pool.query(query);
            loggerServer.info(`All transfer transactions from address ${fromAddress} retrieved successfully`);
            return result.rows;
        } catch (error) {
            loggerServer.error('Error querying data:', error);
            throw error;
        }
    }
    

    async getAllAproval() {
        const query = {
            text: "SELECT * FROM contract_logs WHERE eventName='Approval'"
        };
        try {
            loggerServer.trace('get data');
            const result = await this.pool.query(query);
            return result.rows;
        } catch (error) {
            loggerServer.error('Error inserting data:', error);
            return error;
        }
    }



    async insertData(blockNumber: number, eventName: string, fromAddress: string, toAddress: string, value: number) {
        const query = {
            text: 'INSERT INTO contract_logs (blockNumber, eventName, fromAddress, toAddress, value) VALUES ($1, $2, $3, $4, $5)',
            values: [blockNumber, eventName, fromAddress, toAddress, value],
        };
        try {
            loggerServer.trace('Data insert wating...');
            await this.pool.query(query);
            loggerServer.info('Data inserted successfully');
        } catch (error) {
            loggerServer.error('Error inserting data:', error);
            return error;
        }
    }

    async startBdd() {
        return this.pool.connect();
    }

    addLogs() {
        console.log("Add Logs DATABASE");
        //this.insertData(0, "eventName", "fromAddress", "toAddress", 1)
        this.getData()
    }
}