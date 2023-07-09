export const getReturnStatusCodeFromBoolean = (didSucceed: boolean) =>
  didSucceed ? 200 : 400;
