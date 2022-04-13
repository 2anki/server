import path from "path";
import ensureExists from "./ensureExists";
import { MockType } from "./MockType";

export default function dataMockPath(type: MockType, id: string): string {
  const dir = path.join(__dirname, `../payloads/${type}`);
  ensureExists(dir);
  return path.join(dir, `${id}.json`);
}
