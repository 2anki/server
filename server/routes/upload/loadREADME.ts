import path from "path";
import fs from "fs";

import { TEMPLATE_DIR } from "../../lib/constants";

export default function loadREADME(): string {
  return fs.readFileSync(path.join(TEMPLATE_DIR, "README.html")).toString();
}
