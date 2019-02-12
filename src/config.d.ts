declare module "*.json" {
    const prefix: string;
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
            color: string;
        }
    }
    // export default token;
}