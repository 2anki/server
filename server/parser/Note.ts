export default class Note {
  name: string;
  back: string;
  tags: string[];
  cloze = false;
  number = 0;
  enableInput = false;
  answer = "";
  media: string[] = [];
  notionId?: string;

  constructor(name: string, back: string) {
    this.name = name;
    this.back = back;
    this.tags = [];
  }
}
