import fs from "fs";

export default function getPayload(path: string): any {
  return JSON.parse(fs.readFileSync(path).toString());
}
