#!/bin/sh

[ ! -d "blog.2anki.net" ] && git clone https://github.com/alemayhu/blog.2anki.net

cd blog.2anki.net && yarn install && yarn build && cp -r _site ../dist/blog