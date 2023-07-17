# 2anki/server

[![Twitter](https://img.shields.io/twitter/url/https/twitter.com/cloudposse.svg?style=social&label=Follow%20%40aalemayhu)](https://twitter.com/aalemayhu)

The goal of the 2anki.net project is to provide a good way to make [Anki](https://apps.ankiweb.net/) flashcards easier, better and faster. The dream is to have powerful and easy ways to produce high quality flashcards. This project is a complement to Anki and Notion.

For the frontend code, please see [2anki/web](https://github.com/2anki/web).

## Strategy

<p align="center">  
  <a href="http://www.youtube.com/watch?v=oMg70YIqRsw">
    <img src="http://img.youtube.com/vi/oMg70YIqRsw/0.jpg" alt="My Thoughts on The Future of Anki Collaborative Deck Creation">
  </a>
  </img>

## What We Are Not

If you are looking for a Anki or Notion replacement then this project is probably not right for you. Watch this video [Notion + Anki](https://youtu.be/FjifJG4FoXY) to understand the project's goal. **We are never going to compete against Anki in this project**. We are building bridges.

When that is said, if you are not content with Anki, you might want to checkout [SuperMemo](https://www.super-memory.com/).

## Benefits

- No technical skills required and free to use by anyone anywhere 🤗 \*
- You can convert your Notion [toggle lists][tl] to Anki cards easily.
- Support for embeds, audio files, images and more.

<sub><sup>\* Please note that due to server costs, there are quota limits in place but you can workaround this and self-host</sup><sub>

## 🎁 Support the Project

> This project is brought to you by our amazing [patrons](https://patreon.com/alemayhu)
> and [GitHub sponsors](https://github.com/sponsors/alemayhu) 🤩 Thank you!

[![Patreon](https://github.com/aalemayhu/aalemayhu/raw/master/assets/become_a_patron_button.png)](https://patreon.com/alemayhu)
[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/W7W6QZNY)
<a href="https://www.buymeacoffee.com/aalemayhu"  rel="noreferrer" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>

[![GitHub Sponsor](https://img.shields.io/badge/donate-sponsors-ea4aaa.svg?logo=github)](https://github.com/sponsors/alemayhu/)
[![Paypal](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://paypal.me/alemayhu)

You can also support the project financially and receive exclusive member benefits ✨

[tl]: https://www.notion.so/Toggles-c720af26b4bd4789b736c140b2dc73fe

## How it works

We treats toggle lists on the top level as Anki flashcards. The toggle list line is the front of the card and everything inside in the details is the back. That's the main feature but you can customize the behaviour via card options.

Considering how powerful [cloze deletions](https://docs.ankiweb.net/#/editing?id=cloze-deletion) are, they are enabled by default. To see how this works in action check out this video by [Alp Kaan](https://alpkaanaksu.com/): [How to use cloze deletions in notion2anki 🤩
](https://youtu.be/r9pPNl8Mx_Q)

You can use the card type to flip which creates a mix of the cards. Basic (front & back), basic + reversed and just reversed.

So by default we are reading in the Notion styles which does not necessarily look good on all devices. Especially on iOS you can see some weird text alignment issues. Those can be solved by adding this to your card template:

```css
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

## Limitations

We are still heavily relying on the APKG format. Long term we want to support AnkiWeb and make it possible to do true realtime collaboration.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=2anki/server&type=Date)](https://star-history.com/#2anki/server&Date)


## Credits

Special thanks to following developers / artistans

<table>
    <tr>
        <td align="center">
            <a href="https://alemayhu.com">
                <img src="https://avatars1.githubusercontent.com/u/925044?s=460&u=3bbe382e30dac01219f2423abcb7f6c1a47b9b5a&v=4" width="100px;" alt=""/>
                <br /><sub>
                <b>Alexander Alemayhu</b>
                </sub></a><br />
                <a href="https://github.com/alemayhu/notion2anki/commits?author=aalemayhu" title="Code">💻</a>
                <a href="https://github.com/alemayhu/notion2anki/pulls?q=is%3Apr+reviewed-by%3Aaalemayhu" title="Reviewed Pull Requests">👀</a>
                <a href="https://github.com/alemayhu/notion2anki/commits?author=aalemayhu" title="Documentation">📖</a>
                <a href="https://www.youtube.com/channel/UCVuQ9KPLbb3bfhm-ZYsq-bQ" title="Videos">📹</a>
        </td>
        <td align="center">
            <a href="https://alpkaanaksu.com">
                <img src="https://avatars0.githubusercontent.com/u/68744864?s=460&u=14e5b70a520bf800b4ed942640b9f825bb3d997b&v=4" width="100px;" alt=""/>
                <br /><sub>
                <b>Alp Kaan Aksu</b>
                </sub></a><br />
                <a href="https://github.com/alemayhu/notion2anki/commits?author=alpkaanaksu" title="Code">💻</a>
                <a href="https://www.youtube.com/channel/UCVuQ9KPLbb3bfhm-ZYsq-bQ" title="Videos">📹</a>
        </td>
        <td align="center">
            <a href="https://github.com/Mobilpadde">
                <img src="https://avatars2.githubusercontent.com/u/1170567?s=460&u=7fffacd722d6f39535f1b71a25e6b853a7451d80&v=4" width="100px;" alt=""/>
                <br /><sub>
                <b>Mads Cordes</b>
                </sub></a><br />
                <a href="https://github.com/alemayhu/notion2anki/commits?author=mobilpadde" title="Code">💻</a>
        </td>
        <td align="center">
            <a href="https://www.guillempalausalva.com/">
                <img src="https://avatars2.githubusercontent.com/u/8341295?s=460&u=14d22c0bb0bab69ac305b38ac6533158ad4ce8b3&v=4" width="100px;" alt=""/>
                <br /><sub>
                <b>Guillem Palau-Salvà</b>
                </sub></a><br />
                <a href="#questions" title="Answering Questions">💬</a>
                <a href="#ideas" title="Ideas & Planning">🤔</a>
        </td>
        <td align="center">
            <a href="https://nyasaki.dev/">
                <img src="https://avatars1.githubusercontent.com/u/23500970?s=460&u=9d1f3847e7e960e436051b8d6e39885cf650d841&v=4" width="100px;" alt=""/>
                <br /><sub>
                <b>Marcel Walk</b>
                </sub></a><br />
                <a href="#questions" title="Tests">⚠</a>
                <a href="https://github.com/alemayhu/notion2anki/commits?author=MarcelWalk" title="Code">💻</a>
        </td>
        <!-- Add Henrik (https://github.com/henrik-de), Abi, Boni when you get the necessary information -->
    </tr>
</table>

## License

Unless otherwise specified in the source:

The code is licensed under the [MIT](./LICENSE) Copyright (c) 2020-2023, [Alexander Alemayhu][1]

[1]: https://alemayhu.com
