"""
Test that the template path resolves to the server's templates dir
and that the bundled JSON templates can be loaded.

This guards against path drifts caused by repo layout changes
(e.g. monorepo moves) — the previous regression went unnoticed
because no test exercised actual file IO here.
"""
import os

import pytest

from . import get_template


def test_get_template_path_resolves_to_existing_dir():
    """The resolved template path points at a real directory on disk."""
    resolved = os.path.realpath(get_template.get_template_path())
    assert os.path.isdir(resolved), f"template dir not found: {resolved}"


@pytest.mark.parametrize(
    "file_name", ["n2a-basic.json", "n2a-cloze.json", "n2a-input.json"]
)
def test_bundled_template_loads(file_name):
    """Each bundled template JSON loads as a dict with a non-empty name."""
    template = get_template.get_template(file_name)
    assert isinstance(template, dict)
    assert template.get("name")
