# Notion 2 Anki [![Netlify Status](https://api.netlify.com/api/v1/badges/5da03a4d-2c54-4343-8949-33124d2211e5/deploy-status)](https://app.netlify.com/sites/vibrant-swirles-654fce/deploys)

![Banner](https://i.imgur.com/lZKZTnT.png)

This is tool to let you convert your Notion toggle lists to Anki cards easily.

This project was hacked together after seeing this post on Reddit 
https://www.reddit.com/r/Anki/comments/g29mzk/cards_imported_from_notion/

## Contributing

Your contributions are welcome but please try to be constructive and follow the
[CoC](./CODE_OF_CONDUCT.md).

Please note that the Imba programming language v2 is currently in alpha so expect
to see things breaking when you try stuff. When that is said, see below on how
to actually run this :smile:

## Development

> I am assuming you have Node.js already installed, if not then see their website on how todo that https://nodejs.org/en/

First make sure you have the dependencies installed
```
yarn # npm run install
```

Then in another terminal run 

```
yarn watch
```

The previous command will continously build the project.

To actually see the app running you need to serve the `public` directory,
which you can do with many different tools but I usually end up using one
of these to

1) In another terminal shell run
```
➜ cd public && python3 -m http.server
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
```

2)

Run the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) in vscode.

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
- [Bulma](https://bulma.io)

See the [package.json](./package.json) file for anything I missed.


## Backlog

- [ ] Fix image sizing or consider proper Markdown support
- [ ] Reduce the script out via Webpack
- [ ] Support other formats like HTML
- [ ] Add Dark Mode
