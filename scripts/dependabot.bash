#!/bin/bash

current_branch=$(git branch --show-current)

gh pr list --search "author:app/dependabot is:open" --json number,headRefName --jq '.[] | "\(.number) \(.headRefName)"' | while read -r pr_number branch_name; do
  echo "Merging PR #$pr_number from branch $branch_name into $current_branch"
  git fetch origin $branch_name
  git merge --no-ff --no-verify origin/$branch_name
  gh pr close $pr_number --comment "Merged successfully into $current_branch."
done