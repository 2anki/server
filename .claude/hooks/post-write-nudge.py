#!/usr/bin/env python3
"""
PostToolUse → Write/Edit: non-blocking nudges.

Only writes a brief additionalContext message; never blocks. Two cases:

  1. The edited source has a colocated FEATURE.md — remind the model to keep
     it in sync if behaviour changed.
  2. A dependency-defining file (package.json / pnpm-lock.yaml) changed —
     remind to verify install + record the why in the commit body.
"""
import json
import os
import sys


DEP_FILES = {
    "package.json",
    "pnpm-lock.yaml",
    "pnpm-workspace.yaml",
    ".nvmrc",
    "tsconfig.json",
}


def emit(message):
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "PostToolUse",
            "additionalContext": message,
        }
    }))
    sys.exit(0)


def quiet():
    sys.exit(0)


def get_path(data):
    name = data.get("tool_name")
    inp = data.get("tool_input", {}) or {}
    if name in ("Write", "Edit"):
        return inp.get("file_path")
    if name == "NotebookEdit":
        return inp.get("notebook_path")
    return None


def find_feature_doc(path, repo_root):
    cur = os.path.dirname(path)
    repo_root = os.path.realpath(repo_root)
    while True:
        candidate = os.path.join(cur, "FEATURE.md")
        if os.path.isfile(candidate):
            try:
                rel = os.path.relpath(candidate, repo_root)
            except ValueError:
                rel = candidate
            return rel
        parent = os.path.dirname(cur)
        if parent == cur:
            return None
        if os.path.realpath(cur) == repo_root:
            return None
        cur = parent


def main():
    try:
        data = json.loads(sys.stdin.read())
    except json.JSONDecodeError:
        quiet()

    if data.get("tool_name") not in ("Write", "Edit", "NotebookEdit"):
        quiet()

    path = get_path(data)
    if not path:
        quiet()

    repo_root = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
    abs_path = path if os.path.isabs(path) else os.path.join(repo_root, path)

    nudges = []

    feature_doc = find_feature_doc(abs_path, repo_root)
    if feature_doc:
        nudges.append(
            f"Heads up: a colocated `{feature_doc}` exists for this module. "
            "If this change altered the responsibilities, public surface, or "
            "constraints described there, update it in the same commit."
        )

    base = os.path.basename(path)
    if base in DEP_FILES:
        nudges.append(
            f"`{base}` changed — run `pnpm install` to update the lockfile, "
            "verify `/check` passes, and record *why* the bump was needed in "
            "the commit body (link CVE / changelog if relevant)."
        )

    if not nudges:
        quiet()

    emit("\n\n".join(nudges))


if __name__ == "__main__":
    main()
