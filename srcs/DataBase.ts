
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

  /*  async deleteAllData() {
        const query = {
            text: 'DELETE FROM contract_logs',
        };
        try {
            loggerServer.trace('All data are delete waiting...');
            await this.client.query(query);
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
            const result = await this.client.query(query);
            loggerServer.info('Data fetched successfully');
            return result.rows;
        } catch (error) {
            loggerServer.error('Error fetching data:', error);
            throw error;
        }
    }


    async insertData(blockNumber: number, eventName: string, fromAddress: string, toAddress: string, value: number) {
        const query = {
            text: 'INSERT INTO contract_logs (blockNumber, eventName, fromAddress, toAddress, value) VALUES ($1, $2, $3, $4, $5)',
            values: [blockNumber, eventName, fromAddress, toAddress, value],
        };
        try {
            loggerServer.trace('Data insert wating...');
            await this.client.query(query);
            loggerServer.info('Data inserted successfully');
        } catch (error) {
            loggerServer.error('Error inserting data:', error);
            return error;
        }
    }
    */
    async startBdd() {
        return this.pool.connect();
    }
}