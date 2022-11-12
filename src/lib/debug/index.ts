/**
 *  If the default bucket is not set, we can safely assume we are running in debug mode.
 * @returns boolean
 */
export const IsDebug = () =>
  process.env.SPACES_DEFAULT_BUCKET_NAME === undefined;
