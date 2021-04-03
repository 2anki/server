export default class Note {
  name: string;
  back: string;
  tags: string[];
  cloze = false;
  number = 0;
  enableInput = false;
  answer = "";
  media: string[] = [];

  constructor(name: string, back: string) {
    this.name = name;
    this.back = back;
    this.tags = [];

    if (!back) {
      throw new Error("Missing back side");
    }
  }
}
