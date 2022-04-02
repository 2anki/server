export const IsDebug = () => {
  return process.env.SPACES_DEFAULT_BUCKET_NAME == "dev.2anki.net";
};
