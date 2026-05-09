#!/usr/bin/env python3
"""
PreToolUse hook: block `gh pr merge` when any check has FAILURE.

Reads `gh pr view <num> --json statusCheckRollup` and refuses the merge
if ANY rollup entry has conclusion == "FAILURE". This catches checks that
GitHub branch protection didn't mark as required (e.g. SonarCloud).

Bypass: CLAUDE_SKIP_SAFETY=1 gh pr merge ...
"""
import json
import os
import re
import subprocess
import sys


def allow():
    print(json.dumps({"continue": True}))
    sys.exit(0)


def deny(reason):
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PreToolUse",
            "permissionDecision": "deny",
            "permissionDecisionReason": reason,
        }
    }))
    sys.exit(0)


GH_PR_MERGE = re.compile(r"\bgh\s+pr\s+merge\b")
PR_URL = re.compile(r"https?://github\.com/[^/]+/[^/]+/pull/(\d+)")
PR_BARE_NUMBER = re.compile(r"\b(\d+)\b")


def is_gh_pr_merge(cmd):
    return bool(GH_PR_MERGE.search(cmd))


def extract_pr_ref(cmd):
    after = GH_PR_MERGE.split(cmd, 1)[1]
    after = re.split(r"[;&|]", after, 1)[0]
    url_match = PR_URL.search(after)
    if url_match:
        return url_match.group(1)
    tokens = [t for t in after.split() if not t.startswith("-")]
    for token in tokens:
        if token.isdigit():
            return token
    return None


def fetch_check_rollup(pr_ref):
    args = ["gh", "pr", "view"]
    if pr_ref is not None:
        args.append(pr_ref)
    args.extend(["--json", "statusCheckRollup"])
    try:
        result = subprocess.run(
            args, capture_output=True, text=True, timeout=15,
        )
    except (subprocess.TimeoutExpired, FileNotFoundError) as exc:
        sys.stderr.write(
            f"[check-merge-status] could not run gh ({exc}); allowing merge.\n"
        )
        return None
    if result.returncode != 0:
        sys.stderr.write(
            "[check-merge-status] gh pr view failed; allowing merge. "
            f"stderr: {result.stderr.strip()[:300]}\n"
        )
        return None
    try:
        data = json.loads(result.stdout)
    except json.JSONDecodeError:
        sys.stderr.write(
            "[check-merge-status] could not parse gh JSON; allowing merge.\n"
        )
        return None
    return data.get("statusCheckRollup") or []


def failing_checks(rollup):
    return [
        entry.get("name") or "<unnamed>"
        for entry in rollup
        if entry.get("conclusion") == "FAILURE"
    ]


def main():
    if os.environ.get("CLAUDE_SKIP_SAFETY"):
        allow()

    try:
        data = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        allow()

    if data.get("tool_name") != "Bash":
        allow()

    cmd = data.get("tool_input", {}).get("command", "")

    if not is_gh_pr_merge(cmd):
        allow()

    pr_ref = extract_pr_ref(cmd)
    rollup = fetch_check_rollup(pr_ref)
    if rollup is None:
        allow()

    failing = failing_checks(rollup)
    if failing:
        bullet_list = "\n".join(f"  - {name}" for name in failing)
        deny(
            "Refusing `gh pr merge` — the following checks have conclusion=FAILURE:\n"
            f"{bullet_list}\n\n"
            "All check rollup entries must be green (or non-FAILURE) before merge — "
            "GitHub branch protection only enforces named required checks. "
            "Investigate each failure before merging.\n"
            "Bypass with CLAUDE_SKIP_SAFETY=1 if you've verified the failure is acceptable."
        )

    allow()


if __name__ == "__main__":
    main()
