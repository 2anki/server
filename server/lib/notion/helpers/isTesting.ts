export default function isTesting () {
    return process.env.JEST_WORKER_ID !== undefined;
}