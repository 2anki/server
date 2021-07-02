#!/bin/bash

tmux new-session -d 'npm --prefix server start'
tmux split-window -h 'npm --prefix web start'
tmux -2 attach-session -d