#!/usr/bin/env bash
# Claude Code status line: folder | git branch | PR | token usage

RESET='\033[0m'
DIM='\033[2m'
CYAN='\033[36m'
YELLOW='\033[33m'
GREEN='\033[32m'
RED='\033[31m'
MAGENTA='\033[35m'
SEP=" ${DIM}|${RESET} "

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
    case "$pr_state" in
      OPEN)   pr_color="$GREEN" ;;
      MERGED) pr_color="$MAGENTA" ;;
      CLOSED) pr_color="$DIM" ;;
      *)      pr_color="$RESET" ;;
    esac
    pr_info="${pr_color}PR#${pr_num}(${pr_state})${RESET}"
  fi
fi

# Context window — traffic-light colouring
ctx_part=""
used_pct=$(echo "$input" | jq -r '.context_window.used_percentage // empty')
if [ -n "$used_pct" ]; then
  pct_int=$(printf "%.0f" "$used_pct")
  if   [ "$pct_int" -ge 80 ]; then ctx_color="$RED"
  elif [ "$pct_int" -ge 50 ]; then ctx_color="$YELLOW"
  else                              ctx_color="$GREEN"
  fi
  ctx_part="${ctx_color}ctx:${pct_int}%${RESET}"
fi

# Session cost in USD
cost_part=""
total_cost=$(echo "$input" | jq -r '.cost.total_cost_usd // empty')
if [ -n "$total_cost" ]; then
  cost_part="${DIM}\$$(printf "%.4f" "$total_cost")${RESET}"
fi

# Assemble
result="${CYAN}${folder}${RESET}"
[ -n "$branch" ]    && result+="${SEP}${YELLOW}${branch}${RESET}"
[ -n "$pr_info" ]   && result+="${SEP}${pr_info}"
[ -n "$ctx_part" ]  && result+="${SEP}${ctx_part}"
[ -n "$cost_part" ] && result+="${SEP}${cost_part}"

printf '%b' "$result"
