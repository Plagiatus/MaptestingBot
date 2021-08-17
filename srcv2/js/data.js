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
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
class Data {
    constructor() {
        this.commands = new Map();
        if (Data.instance) {
            return Data.instance;
        }
        this.path = "./srcv2/";
        this.loadConfigs();
        // this.loadCommands();
        Data.instance = this;
    }
    loadConfigs() {
        this.config = JSON.parse(fs.readFileSync(this.path + "config.json", { encoding: "utf-8" }));
        this.secretConfig = JSON.parse(fs.readFileSync(this.path + "secretconfig.json", { encoding: "utf-8" }));
    }
    loadCommands() {
        return __awaiter(this, void 0, void 0, function* () {
            let path = this.path + "js/commands/";
            let files = fs.readdirSync(path).filter(file => file.endsWith(".js"));
            for (let f of files) {
                let command = yield Promise.resolve().then(() => require(this.path + "js/commands/" + f));
                this.commands.set(command.name, command);
            }
        });
    }
}
exports.Data = Data;
//# sourceMappingURL=data.js.map