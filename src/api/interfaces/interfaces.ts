export interface IProjection {
    [key: string]: 1 | 0
}

export interface IParamsGetId {
    id: string
}

export interface IQueryList {
    [key: string]: string
}

export interface ILogin {
    username: string;
    password: string;
    type: string;
}

export interface IPasswordBody {
    password: string;
}
