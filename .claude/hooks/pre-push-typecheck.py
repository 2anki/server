#!/usr/bin/env python3
"""
PreToolUse hook: run server `tsc --noEmit` before `git push` to a feature branch.

Goal: stop pushing red branches that then fail GH Actions and chew CI minutes.
Skips pushes to main/master (safety.py blocks those anyway). Skips when tsc
would cost more than it saves (no .ts changes since the last push).

Bypass: CLAUDE_SKIP_TYPECHECK=1 git push ...
        CLAUDE_SKIP_SAFETY=1     git push ...   (also honored)
"""
import json
import os
import re
import subprocess
import sys

TIMEOUT_SECONDS = 120


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


GIT_PUSH = re.compile(r"\bgit\s+push\b")
PROTECTED_BRANCH = re.compile(r"\b(main|master)\b")


def is_git_push(cmd):
    return bool(GIT_PUSH.search(cmd))


def push_targets_protected(cmd):
    after = GIT_PUSH.split(cmd, 1)[1]
    after = re.split(r"[;&|]", after, 1)[0]
    return bool(PROTECTED_BRANCH.search(after))


def has_ts_changes_against_origin():
    """True if any tracked .ts/.tsx file differs from origin/main, or there are
    uncommitted .ts/.tsx changes. False means tsc has nothing new to say."""
    try:
        committed = subprocess.run(
            ["git", "diff", "--name-only", "origin/main...HEAD"],
            capture_output=True, text=True, timeout=10,
        ).stdout
        working = subprocess.run(
            ["git", "diff", "--name-only", "HEAD"],
            capture_output=True, text=True, timeout=10,
        ).stdout
    except Exception:
        return True  # err on the side of running tsc
    files = (committed + "\n" + working).splitlines()
    return any(f.endswith((".ts", ".tsx")) for f in files)


def run_typecheck(project_dir):
    try:
        result = subprocess.run(
            ["pnpm", "exec", "tsc", "--noEmit", "-p", "."],
            cwd=project_dir,
            capture_output=True, text=True, timeout=TIMEOUT_SECONDS,
        )
    except subprocess.TimeoutExpired:
        sys.stderr.write(
            f"[pre-push-typecheck] tsc exceeded {TIMEOUT_SECONDS}s; allowing push.\n"
        )
        return None
    except FileNotFoundError:
        sys.stderr.write("[pre-push-typecheck] pnpm not on PATH; allowing push.\n")
        return None
    if result.returncode == 0:
        return True
    return result.stdout or result.stderr or "(tsc produced no output)"


def main():
    if os.environ.get("CLAUDE_SKIP_TYPECHECK") or os.environ.get("CLAUDE_SKIP_SAFETY"):
        allow()

    try:
        data = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        allow()

    if data.get("tool_name") != "Bash":
        allow()

    cmd = data.get("tool_input", {}).get("command", "")
    if not is_git_push(cmd):
        allow()

    if push_targets_protected(cmd):
        allow()  # safety.py owns this case

    project_dir = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()

    if not has_ts_changes_against_origin():
        allow()

    sys.stderr.write("[pre-push-typecheck] running server tsc --noEmit...\n")
    result = run_typecheck(project_dir)
    if result is None or result is True:
        allow()

    head = "\n".join(result.splitlines()[:30])
    deny(
        "Refusing `git push` — server tsc --noEmit failed. First errors:\n\n"
        f"{head}\n\n"
        "Fix the type errors, or bypass with CLAUDE_SKIP_TYPECHECK=1 if pushing a WIP branch."
    )


if __name__ == "__main__":
    main()
