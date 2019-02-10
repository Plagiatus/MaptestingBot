declare module "*.json" {
    const token: string;
    const prefix: string;
    const dbuser: string;
    const dbpass: string;
    const xpSettings: {
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
    const sessionCategories: {
        [key: string]: {
            img:string;
        }
    }
    // export default token;
}