export function isEmptyObject(obj: object | undefined) {
  if (obj) {
    return Object.keys(obj).length === 0;
  } else {
    return true;
  }
}
