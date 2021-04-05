#!/bin/bash

tmux new-session -d 'yarn --cwd server start'
tmux split-window -h 'yarn --cwd web start'
tmux -2 attach-session -d