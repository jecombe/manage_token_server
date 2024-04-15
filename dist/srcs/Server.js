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
exports.Server = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const logger_js_1 = require("../utils/logger.js");
const DataBase_js_1 = require("./DataBase.js");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 8000;
class Server extends DataBase_js_1.DataBase {
    constructor() {
        super();
    }
    startApp() {
        const corsOptions = {
            origin: "*",
            optionsSuccessStatus: 200,
        };
        app.use((0, cors_1.default)(corsOptions));
        app.use(express_1.default.json());
        app.use(express_1.default.urlencoded({ extended: false }));
        app.listen(port, () => {
            logger_js_1.loggerServer.info(`Server is listening on port ${port}`);
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.startApp();
                yield this.startBdd();
                logger_js_1.loggerServer.trace("Connected to PostgreSQL database");
            }
            catch (error) {
                logger_js_1.loggerServer.error(error);
            }
        });
    }
}
exports.Server = Server;
