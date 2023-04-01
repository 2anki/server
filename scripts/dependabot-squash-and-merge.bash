#!/bin/bash

for pr in $(gh pr list --state open | awk '{ print $1 }'); do
    gh pr comment $pr --body "@dependabot squash and merge"
done
