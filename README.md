# notion.2anki.net

[![Netlify Status](https://api.netlify.com/api/v1/badges/5da03a4d-2c54-4343-8949-33124d2211e5/deploy-status)](https://app.netlify.com/sites/vibrant-swirles-654fce/deploys) [![Discord](https://img.shields.io/discord/723998078201495642)](https://discord.com/invite/PSKC3uS)

notion2Anki is a passion project. We are going to make this a good way to make Anki flashcards easier, better and faster. 

- You can convert your Notion [toggle lists][tl] to Anki cards easily.
- No technical skills required and 100% free to use by anyone anywhere 🤗
- Support for embeds, audio files, images and more.

[tl]: https://www.notion.so/Toggles-c720af26b4bd4789b736c140b2dc73fe

## How it works

notion2Anki treats toggle lists on the top level as Anki cards. The toggle list line is the front of the card and everything inside in the details is the back. 

Considering how powerful [cloze deletions](https://docs.ankiweb.net/#/editing?id=cloze-deletion) are, they are the default note type. To see how this works in action check out this vide from [Alp Kaan](https://alpkaanaksu.com/): [How to use cloze deletions in notion2anki 🤩
](https://youtu.be/r9pPNl8Mx_Q)

You can use the card type to flip which creates a mix of the cards. Basic (front & back), basic + reversed and just reversed.

So by default we are reading in the Notion styles which does not necessarily look good on all devices. Especially on iOS you can see some weird text alignment issues. Those can be solved by adding this to your card template:

```
body {
    padding: 1rem;
    text-align: left;
}
```

## Background

This project was hacked together after seeing this post on Reddit by [jacksong97](https://www.reddit.com/user/jacksong97):

> Hey guys just need a little help with something. 
>
> I have a whole bunch of questions that I've written for myself within Notion (nested toggle questions). I was hoping I could transfer them into Anki cards fairly painlessly. I have done some just copying and pasting each side separately but it just took too long. 
>
> Is there a way to import directly or copy and paste into a txt file or something that will create the cards for me? 
>
> Thanks!
>
> Edit: if I were to just turn them into a text file, how do I set which text goes to the back of the card? I’ve been able to get them all into seperate cards but just the fronts

https://www.reddit.com/r/Anki/comments/g29mzk/cards_imported_from_notion/

## Roadmap

The dream is to have a powerful and easy to use process for producing high quality flashcards. Notion is super easy to use and Notion 2 Anki is just going to make the importing process and controlling the look of the cards / decks smooth. This project is a complement to Anki and Notion. See the [projects page][pa] for the specific topics https://github.com/alemayhu/notion2anki/projects/1

[pa]: https://github.com/alemayhu/notion2anki/projects/1

## Contributing

Your contributions are welcome but please try to be constructive and follow the [code of conduct](./CODE_OF_CONDUCT.md).

## Support

You can support the project by [becoming a sponsor / backer on Patreon](http://patreon.com/alemayhu).

## Development

Please note that the [Imba](http://v2.imba.io/) programming language v2 is currently in alpha so expect to see things breaking when you try stuff. When that is said, see below on how to actually run this :smile:

I am assuming you have Node.js already installed, if not then see their website on how install it https://nodejs.org/en/

First make sure you have the dependencies installed
```bash
yarn # npm run install
```

Then in another terminal run 

```bash
yarn watch # npm run watch
```

The previous command will continously build the project.

To actually see the app running you need to either visit the local url in a browser or launch the app with

```
yarn dev-server # npm run dev-server
```

## Credits

This would be super hard if it were not for the following projects:

- [anki-apkg-export](https://github.com/repeat-space/anki-apkg-export)
- [genanki](https://github.com/kerrickstaley/genanki)
- [jszip](https://github.com/Stuk/jszip)
- [Imba](https://github.com/imba/imba)

See the [package.json](./package.json) file for anything I missed.

## License

Unless otherwise specified in the source:

```
The code is licensed under the [MIT](./LICENSE) Copyright (c) 2020, [Alexander Alemayhu][1]

The MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

[1]: http://alemayhu.com
```