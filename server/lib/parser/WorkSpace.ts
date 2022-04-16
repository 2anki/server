import path from "path";
import fs from "fs";

import { nanoid } from "nanoid";

class Workspace {
  location: string;
  constructor(isNew: boolean, type: string) {
    if (isNew && type === "fs") {
      this.location = path.join(process.env.WORKSPACE_BASE!, nanoid());
    } else {
      throw new Error("unsupported " + type);
    }
    this.ensureExists();
  }
  private ensureExists() {
    if (!fs.existsSync(this.location)) {
      fs.mkdirSync(this.location, { recursive: true });
    }
  }
}

export default Workspace;
