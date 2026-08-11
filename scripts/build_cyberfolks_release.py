#!/usr/bin/env python3
"""Assemble the prerendered Timzy site for conventional PHP hosting."""

from __future__ import annotations

import shutil
from pathlib import Path


PROJECT = Path(__file__).resolve().parents[1]
CLIENT = PROJECT / "dist" / "client"
PRERENDERED = PROJECT / "dist" / "server" / "prerendered-routes"
OVERLAY = PROJECT / "deploy" / "cyberfolks" / "public_html"
OUTPUT = PROJECT / "release" / "cyberfolks-public_html"


def copy_prerendered_pages() -> None:
    for source in PRERENDERED.rglob("*.html"):
        relative = source.relative_to(PRERENDERED)
        if relative.name in {"index.html", "404.html"} and len(relative.parts) == 1:
            target = OUTPUT / relative.name
        else:
            route = relative.with_suffix("")
            target = OUTPUT / route / "index.html"
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)


def main() -> None:
    if not CLIENT.is_dir() or not PRERENDERED.is_dir():
        raise SystemExit("Run the prerender build before assembling the CyberFolks release")
    shutil.rmtree(OUTPUT, ignore_errors=True)
    shutil.copytree(CLIENT, OUTPUT)
    copy_prerendered_pages()
    shutil.copytree(OVERLAY, OUTPUT, dirs_exist_ok=True)
    files = sum(1 for path in OUTPUT.rglob("*") if path.is_file())
    print(f"CyberFolks release ready: {files} files in {OUTPUT}")


if __name__ == "__main__":
    main()
