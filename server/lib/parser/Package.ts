class Package {
  name: string;
  apkg: Buffer;

  constructor(name: string, apkg: Buffer) {
    this.name = name;
    this.apkg = apkg;
  }
}

export default Package;
