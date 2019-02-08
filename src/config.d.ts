declare module "*.json" {
    const token: string;
    const prefix: string;
    const dbuser: string;
    const dbpass: string;
    const xpSettings: {
        levels: [
            {
                lvl:number,
                minXP: number,
                color: string,
                img: string
            }];
    }
    // export default token;
}