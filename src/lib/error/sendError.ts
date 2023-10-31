export const sendError = (error: unknown) => {
  if (error instanceof Error) {
    console.error(error);
  } else {
    console.log('unknown error '+ error);
  }
};
