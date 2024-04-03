export interface IConfigSecure {
    secretJWT: string;
    tokenExpirationTime: string;
    unprotected: Array<string>;
}

export interface IConfigRedis {
    enable: boolean;
    url: string;
}

export interface IConfig {
    logger: {
        development: object | boolean;
        production: object | boolean;
        local: object | boolean;
    };
    mongo: {
        url: string;
        debug: boolean
    };
    redis: IConfigRedis;
    server: {
        host: string;
        port: number;
        secure: IConfigSecure;
    }
}