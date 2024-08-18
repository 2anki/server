export const sendError = (error: unknown) => {
  console.warn(
    'sendError is deprecated, instead handle the error on the callsite'
  );
  console.error(error);
  if (error instanceof Error) {
    console.error(error);
  } else {
    console.log('unknown error ' + error);
  }
};
