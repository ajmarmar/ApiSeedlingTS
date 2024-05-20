export interface IConfigSecure {
    secretJWT: string;
    tokenExpirationTime: string;
    unprotected: Array<string>;
}

export interface IConfigRedis {
    enable: boolean;
    url: string;
}

export interface IConfigMetrics {
    enable: boolean;
    path: string;
}

export interface IConfigRepository {
    path: string;
    maxFile: number;
    compress: boolean;
    noCompress: Array<string>;
    limits: {
        fileSize: number;
        files: number;
    }
}

export interface IConfig {
    logger: {
        development: object | boolean;
        production: object | boolean;
        local: object | boolean;
    };
    mongo: {
        url: string;
        databaseName: string;
        debug: boolean
    };
    redis: IConfigRedis;
    server: {
        host: string;
        port: number;
        repository: IConfigRepository;
        secure: IConfigSecure;
        metrics: IConfigMetrics;
    };
    auth: {
        enable: boolean;
        secretJWT: string;
        tokenExpirationTime: string;
        unprotected: Array<string>;
    }
}