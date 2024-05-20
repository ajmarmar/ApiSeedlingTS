import { MultipartFile, SavedMultipartFile } from "@fastify/multipart";
import { AccessControl } from "accesscontrol";
import { FastifyRequest, RouteGenericInterface } from "fastify";

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

export interface IUserRequest {
    exp: number;
    iat: number;
    user: {
        _id: string;
        username: string;
        email: string;
        roles: [ string ]
    }
}

export interface IRole {
    role: string;
    ressoure: string;
}

export interface IRequestServer<T extends RouteGenericInterface = any> extends FastifyRequest<T> {
    accessControl: AccessControl;
}

export interface IBodyUpload {
    resource: { value: string};
    idResource: { value: string};
    file: any;
}