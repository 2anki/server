#!/usr/bin/env python3
"""
PreToolUse safety hook: blocks foot-gun shell commands.

Currently blocks:
  * git push --force / -f / +ref to main or master
  * git reset --hard when there are uncommitted changes
  * rm -rf against /, ~, $HOME, or parent directories

Bypass: CLAUDE_SKIP_SAFETY=1 <command>
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


PROTECTED_BRANCH = re.compile(r"\b(main|master)\b")
FORCE_FLAG = re.compile(r"(?:--force(?:-with-lease)?|(?:^|\s)-f(?:\s|$))")
PLUS_REF = re.compile(r"\s\+(?:main|master)\b")


def is_force_push_to_protected(cmd):
    if "git push" not in cmd:
        return False
    has_force = bool(FORCE_FLAG.search(cmd))
    has_plus = bool(PLUS_REF.search(cmd))
    if not (has_force or has_plus):
        return False
    return bool(PROTECTED_BRANCH.search(cmd))


def has_uncommitted_changes():
    try:
        result = subprocess.run(
            ["git", "status", "--porcelain"],
            capture_output=True, text=True, timeout=5,
        )
        return bool(result.stdout.strip())
    except Exception:
        return False


def is_reset_hard_with_uncommitted(cmd):
    if "git reset --hard" not in cmd:
        return False
    return has_uncommitted_changes()


RM_FLAGS = re.compile(r"\brm\s+(?:-[rRfvi]+\s+)+")
DANGER_RM_PATTERNS = [
    re.compile(r"\brm\s+(?:-[rRfvi]+\s+)+/(?:\s|$)"),
    re.compile(r"\brm\s+(?:-[rRfvi]+\s+)+~(?:\s|/|$)"),
    re.compile(r"\brm\s+(?:-[rRfvi]+\s+)+\$HOME\b"),
    re.compile(r"\brm\s+(?:-[rRfvi]+\s+)+\.\.(?:\s|/|$)"),
]


def is_dangerous_rm(cmd):
    if not RM_FLAGS.search(cmd):
        return False
    return any(p.search(cmd) for p in DANGER_RM_PATTERNS)


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

    if is_force_push_to_protected(cmd):
        deny(
            "Refusing force-push to main/master — rewrites shared history.\n"
            "If you genuinely need this, prefix with CLAUDE_SKIP_SAFETY=1."
        )

    if is_reset_hard_with_uncommitted(cmd):
        deny(
            "Refusing `git reset --hard` with uncommitted changes — would discard work.\n"
            "Commit or stash first, or prefix with CLAUDE_SKIP_SAFETY=1."
        )

    if is_dangerous_rm(cmd):
        deny(
            "Refusing `rm -rf` against critical paths (/, ~, $HOME, parent dirs).\n"
            "Prefix with CLAUDE_SKIP_SAFETY=1 if intentional."
        )

    allow()


if __name__ == "__main__":
    main()
