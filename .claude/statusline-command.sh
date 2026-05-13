#!/usr/bin/env bash
# Claude Code status line: folder | git branch | PR | token usage

input=$(cat)

# Current folder (basename of cwd from JSON, fallback to pwd)
cwd=$(echo "$input" | jq -r '.workspace.current_dir // .cwd // empty')
[ -z "$cwd" ] && cwd="$(pwd)"
folder=$(basename "$cwd")

# Git branch (run in cwd)
branch=""
if git -C "$cwd" rev-parse --git-dir > /dev/null 2>&1; then
  branch=$(git -C "$cwd" symbolic-ref --short HEAD 2>/dev/null || git -C "$cwd" rev-parse --short HEAD 2>/dev/null)
fi

# PR info: number and state for the current branch
pr_info=""
if [ -n "$branch" ] && command -v gh > /dev/null 2>&1; then
  pr_json=$(gh pr list --head "$branch" --json number,state --limit 1 2>/dev/null)
  pr_num=$(echo "$pr_json" | jq -r '.[0].number // empty' 2>/dev/null)
  pr_state=$(echo "$pr_json" | jq -r '.[0].state // empty' 2>/dev/null)
  if [ -n "$pr_num" ]; then
    pr_info="PR#${pr_num}(${pr_state})"
  fi
fi

# Token usage
used_pct=$(echo "$input" | jq -r '.context_window.used_percentage // empty')
tokens_part=""
if [ -n "$used_pct" ]; then
  tokens_part=$(printf "ctx:%.0f%%" "$used_pct")
fi

# Assemble parts
parts=("$folder")
[ -n "$branch" ]      && parts+=("$branch")
[ -n "$pr_info" ]     && parts+=("$pr_info")
[ -n "$tokens_part" ] && parts+=("$tokens_part")

printf '%s' "$(IFS='|'; echo "${parts[*]}")"
