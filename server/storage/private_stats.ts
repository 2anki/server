import { TIME_21_MINUTES_AS_SECONDS } from "../lib/constants";
import StorageHandler from "./StorageHandler";

async function main() {
  let ms = TIME_21_MINUTES_AS_SECONDS * 1000;
  let s = new StorageHandler();
  let files = await s.getContents();

  let count = files.length;
  let now = new Date();
  let sum = 0;

  console.log("File count is ", count);
  for (const file of files) {
    /* @ts-ignore */
    sum += file.Size;
  }
  console.log(
    "Total size out of",
    count,
    " is ",
    sum,
    "and the average size is",
    sum / count
  );
}

main();
