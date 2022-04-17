export default function isTesting (): boolean {
    return process.env.JEST_WORKER_ID !== undefined;
}