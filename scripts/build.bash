#!/bin/bash

export NODE_OPTIONS="--max-old-space-size=8192"

mkdir -pv /tmp/workspaces
mkdir -pv /tmp/uploads

yarn --cwd server install
yarn --cwd web install

yarn --cwd server run build
yarn --cwd web run build