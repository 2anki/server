const cheerio = require('cheerio')

class Tags {
        constructor(card) {
                this.parse(card.front, card.back);
        }

        parse(front, back) {
                let input = [front, back].filter(x => x);
                let tags = [];

                for (const i of input) {
                        const dom = cheerio.load(i);
                        const deletionsDOM = dom('del');
                        const deletionsArray = [deletionsDOM];

                        for (const deletions of deletionsArray) {
                                deletions.each((ii, elem) => {
                                        const del = dom(elem);
                                        tags.push(...del.text().split(',').map(s => s.trim().replace(/\s/g, '-')));
                                        const re = new RegExp(`<del>${del.html()}</del>`, 'g');
                                        this.front = input[0].replace(re, '');
                                        this.back = input[1].replace(re, '');
                                })
                        }
                }
                this.tags = tags; 
        }

}

module.exports.Tags = Tags;