import * as fs from "fs";

export class Data {
	private static instance: Data;
	public config: Config;
	public secretConfig: SecretConfig;
	public commands: Map<string, Command> = new Map<string, Command>();
	private path: string;

	constructor() {
		if (Data.instance) {
			return Data.instance;
		}
		this.path = "./srcv2/";
		this.loadConfigs();
		// this.loadCommands();
		Data.instance = this;
	}

	private loadConfigs(): void {
		this.config = JSON.parse(fs.readFileSync(this.path + "config.json", { encoding: "utf-8" }));
		this.secretConfig = JSON.parse(fs.readFileSync(this.path + "secretconfig.json", { encoding: "utf-8" }));
	}

	private async loadCommands(): Promise<void> {
		let path: string = this.path + "js/commands/";
		let files: string[] = fs.readdirSync(path).filter(file => file.endsWith(".js"));
		for(let f of files){
			let command: Command = await import(this.path + "js/commands/" + f);
			this.commands.set(command.name, command);
		}
	}
}