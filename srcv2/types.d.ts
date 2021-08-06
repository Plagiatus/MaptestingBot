
interface Config {
	ip: string;
	prefix: string;
	xpSettings: {
		levels: [
			{
				lvl: number,
				minXP: number,
				color: string,
				img: string,
				pingcooldown: number
			}
		],
		joinedSessions: {
			xpfor10minutes: number,
			additionalPerMinute: number
		},
		hostedSessions: {
			xpfor10minutes: number,
			additionalPerMinute: number
		}

	};
	sessionCategories: {
		[key: string]: {
			img: string;
			color: string;
		}
	}
}

interface SecretConfig {
	token: string;
	dbuser: string;
	dbpass: string;
	xboxtoken: string;
}

declare type CommandHandler = (message: any, args?: string[]) => boolean;

interface Command {
    //essentials
    name: string;
    aliases: string[];

    //infos
    description: string;
    usage: string;
		example?: string;

    //options
    needsArgs: boolean;
    guildOnly: boolean;
    grantedOnly: boolean;
    globalCooldown: number;
    individualCooldown: number;
    hidden: boolean;
    channel: ("all" | "session" | "bot" | "nonsession")[];

    //the actual code to run when this command is called.
    execute: CommandHandler;
}