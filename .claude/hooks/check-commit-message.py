#!/usr/bin/env python3
"""
PreToolUse hook: block git commits that don't document the change.

Cheap heuristics (no LLM call, no length gates so good short commits
aren't punished for being concise):
  * Subject must use a conventional-commit prefix.
  * Body must exist — at least one non-empty, non-trailer line below
    the subject. Length and prose quality are the human's call.

Bypass for one-off cases: CLAUDE_SKIP_COMMIT_CHECK=1 git commit ...
"""
import json
import os
import re
import sys


CONVENTIONAL_PREFIX = re.compile(
    r"^(feat|fix|chore|refactor|test|docs|perf|ci|build|style|revert)(\(.+?\))?!?:\s+\S",
)
TRAILER_LINE = re.compile(
    r"^(Co-Authored-By|Co-authored-by|Signed-off-by|Refs|Closes|Fixes|Reviewed-by|See-also):\s",
    re.IGNORECASE,
)
HEREDOC = re.compile(
    r"<<-?\s*['\"]?(\w+)['\"]?\s*\n(.*?)\n\s*\1\b",
    re.DOTALL,
)
DASH_M_QUOTED = re.compile(r"-m\s+(['\"])(.*?)\1", re.DOTALL)
LONG_FLAG = re.compile(r"--message=(['\"])(.*?)\1", re.DOTALL)

SUBJECT_MAX_LEN = 72
BODY_MIN_LEN = 40


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


def extract_message(command):
    heredoc = HEREDOC.search(command)
    if heredoc:
        return heredoc.group(2)
    plain = DASH_M_QUOTED.search(command)
    if plain:
        return plain.group(2)
    eq = LONG_FLAG.search(command)
    if eq:
        return eq.group(2)
    return None


def main():
    if os.environ.get("CLAUDE_SKIP_COMMIT_CHECK"):
        allow()

    try:
        data = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        allow()

    if data.get("tool_name") != "Bash":
        allow()

    command = data.get("tool_input", {}).get("command", "")

    if "git commit" not in command:
        allow()

    if any(flag in command for flag in ["--amend", "--no-edit", "--squash", "--fixup"]):
        allow()

    message = extract_message(command)
    if message is None:
        allow()

    lines = message.strip().split("\n")
    subject = lines[0].strip()
    body_lines = lines[1:]

    real_body_lines = [
        line for line in body_lines
        if line.strip() and not TRAILER_LINE.match(line.strip())
    ]
    real_body = "\n".join(real_body_lines).strip()

    errors = []

    if not CONVENTIONAL_PREFIX.match(subject):
        errors.append(
            "Subject must start with a conventional-commit prefix "
            "(feat:, fix:, chore:, refactor:, test:, docs:, perf:, ci:, build:, style:, revert:)."
        )

    if len(subject) > SUBJECT_MAX_LEN:
        errors.append(
            "Subject is " + str(len(subject)) +
            " chars; keep it <= " + str(SUBJECT_MAX_LEN) + "."
        )

    if len(real_body) < BODY_MIN_LEN:
        errors.append(
            "Body must explain WHY this change is needed (motivation, context, constraint). "
            "Got " + str(len(real_body)) + " chars of non-trailer body, need at least "
            + str(BODY_MIN_LEN) + ". The diff already shows WHAT; the body should add WHY."
        )

    if errors:
        deny(
            "Commit message quality check failed:\n  - "
            + "\n  - ".join(errors)
            + "\n\nRewrite the message and retry. "
            "Set CLAUDE_SKIP_COMMIT_CHECK=1 in the command env to bypass."
        )

    allow()


if __name__ == "__main__":
    main()
