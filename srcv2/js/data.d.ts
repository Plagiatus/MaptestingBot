export declare class Data {
    private static instance;
    config: Config;
    secretConfig: SecretConfig;
    commands: Map<string, Command>;
    constructor();
    private loadConfigs;
    private loadCommands;
}
