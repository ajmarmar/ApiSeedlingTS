import { AccessControl } from "accesscontrol";
import { IUserRequest } from "src/api/interfaces/interfaces";

export function isEmptyObject(obj: object | undefined) {
  if (obj) {
    return Object.keys(obj).length === 0;
  } else {
    return true;
  }
}

export const getCreateAccess = (ac: AccessControl, user: IUserRequest, resource: string, own?: string ) => {
  let permission = ac.can(user.user.roles[0]).createAny(resource);
  if (!permission.granted && user.user._id === own) {
    permission = ac.can(user.user.roles[0]).createOwn(resource);
  }
  return permission;
} 