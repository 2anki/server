class Package {
  name: string;

  cardCount: number;

  constructor(name: string, cardCount: number = 0) {
    this.name = name;
    this.cardCount = cardCount;
  }
}

export default Package;
