#!/usr/bin/env bash
# Injects a trio-review reminder when a prompt touches user-facing product territory.
# Reads the UserPromptSubmit JSON from stdin; emits additionalContext if the heuristic fires.

set -euo pipefail

prompt=$(cat | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('prompt',''))" 2>/dev/null || true)

# Exclusion: skip when the prompt is clearly about internal tooling, CI, deps, or .claude/ config.
# These false-positive on the keyword regex below (e.g. "user-facing copy" appears in design rules)
# and a wasted trio costs 3 forks (opus + opus + sonnet) per fire.
if echo "$prompt" | grep -qiE \
  '\.claude/|/hooks/|/rules/|/agents/|/commands/|/skills/|\bCI\b|dependabot|dependenc(y|ies)|tooling|claude setup|sub.?agent|prompt cache|model routing'; then
  exit 0
fi

# Heuristic: product-relevant keywords. Tune this list as false-positive/negative patterns emerge.
if echo "$prompt" | grep -qiE \
  'feature|user.facing|ux|ui\b|flow|onboard|sign.?up|pricing|limit|button|screen|page|copy|error message|landing|conversion|upload|deck|card|notion|export|first.run|retention|churn'; then
  python3 - <<'PYEOF'
import json, sys
result = {
  "hookSpecificOutput": {
    "hookEventName": "UserPromptSubmit",
    "additionalContext": (
      "<trio_required>This task touches user-facing or product behavior. "
      "Per CLAUDE.md trio review policy: invoke pm, designer, and engineer subagents "
      "in parallel via the Agent tool before writing any code. "
      "Produce the synthesis block (each agent view, agreements, conflicts, resolution, plan) "
      "before proceeding. Use /trio to force this explicitly.</trio_required>"
    )
  }
}
print(json.dumps(result))
PYEOF
fi
