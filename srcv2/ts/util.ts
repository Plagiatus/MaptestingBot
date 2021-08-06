import { Data } from "./data";

export function timeoutToPromise(time: number, f: Function, ...args): Promise<void> {
  return new Promise((res) => {
    setTimeout(() => {
			f();
			res();
    }, time, ...args)
  })
}

export function findCommandWithAlias(name: string): Command {
	let commands: Map<string, Command> = new Data().commands;
	if (commands.has(name)) return commands.get(name);
		for (let c of commands) {
			if (c[1].aliases.indexOf(name) > -1) return c[1];
		}
		return null;
}

export function handleDiscordRateLimitation(){

}