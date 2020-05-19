![Notion 2 Anki](dist/banner.png)

[![Netlify Status](https://api.netlify.com/api/v1/badges/5da03a4d-2c54-4343-8949-33124d2211e5/deploy-status)](https://app.netlify.com/sites/vibrant-swirles-654fce/deploys)

This is tool a to let you convert your Notion [toggle lists][tl] to Anki cards easily.

[tl]: https://www.notion.so/Toggles-c720af26b4bd4789b736c140b2dc73fe

## Background

This project was hacked together after seeing this post on Reddit 
https://www.reddit.com/r/Anki/comments/g29mzk/cards_imported_from_notion/


## Roadmap

The dream is to have a powerful and easy to use process for producing high quality flashcards. Notion is super easy to use and Notion 2 Anki is just going to make the importing process and controlling the look of the cards / decks smooth. See the [projects page][pa] for the specific topics https://github.com/alemayhu/notion2anki/projects/1

[pa]: https://github.com/alemayhu/notion2anki/projects/1

## Contributing

Your contributions are welcome but please try to be constructive and follow the
[code of conduct](./CODE_OF_CONDUCT.md).

## Support

You can support the project by [becoming a sponsor / backer on Patreon](http://patreon.com/scanf).

## Development

Please note that the Imba programming language v2 is currently in alpha so expect
to see things breaking when you try stuff. When that is said, see below on how
to actually run this :smile:

> I am assuming you have Node.js already installed, if not then see their website on how todo that https://nodejs.org/en/

First make sure you have the dependencies installed
```
yarn # npm run install
```

Then in another terminal run 

```
yarn dev
```

The previous command will continously build the project.

To actually see the app running you need to either visit the local url in a browser or launch the app with

```
yarn start
```

## License

Unless otherwise specified in the source:

[MIT](./LICENSE)

Copyright (c) 2020, Alexander Alemayhu

## Credits

This would be super hard if it were not for the following projects:

- [anki-apkg-export](https://github.com/repeat-space/anki-apkg-export)
- [FileSaver.js](https://github.com/eligrey/FileSaver.js/)
- [jszip](https://github.com/Stuk/jszip)
- [Imba](https://github.com/imba/imba)

See the [package.json](./package.json) file for anything I missed.
