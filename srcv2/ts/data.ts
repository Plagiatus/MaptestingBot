import * as fs from "fs";

export class Data {
	private static instance: Data;
	public config: Config;
	public secretConfig: SecretConfig;
	public commands: Map<string, Command> = new Map<string, Command>();

	constructor() {
		if (Data.instance) {
			return Data.instance;
		}
		this.loadConfigs();
		this.loadCommands();
		Data.instance = this;
	}

	private loadConfigs(): void {
		this.config = JSON.parse(fs.readFileSync("./config.json", { encoding: "utf-8" }));
		this.secretConfig = JSON.parse(fs.readFileSync("./secretconfig.json", { encoding: "utf-8" }));
	}

	private async loadCommands(): Promise<void> {
		let path: string = "./js/commands/";
		let files: string[] = fs.readdirSync(path).filter(file => file.endsWith(".js"));
		for(let f of files){
			let command: Command = await import("./commands/" + f);
			this.commands.set(command.name, command);
		}
	}
}