#!/usr/bin/env python3
"""Encrypted FTPS backup and upload helper for timzy.app.

The password is requested interactively and passed to curl through stdin. It is
never written to disk or included in a process argument.
"""

from __future__ import annotations

import argparse
import ftplib
import getpass
import os
import re
import secrets
import subprocess
from pathlib import Path, PurePosixPath
from urllib.parse import quote


LISTING_RE = re.compile(
    r"^(?P<type>[-dl])\S*\s+\d+\s+\S+\s+\S+\s+(?P<size>\d+)\s+"
    r"\w{3}\s+\d+\s+(?:\d{2}:\d{2}|\d{4})\s+(?P<name>.+)$"
)


def curl_config(username: str, password: str, extra: list[str]) -> bytes:
    lines = [
        "fail",
        "silent",
        "show-error",
        "ftp-ssl-reqd",
        "retry = 3",
        "retry-delay = 1",
        "retry-all-errors",
        "connect-timeout = 20",
        "max-time = 180",
        f'user = "{username}:{password}"',
        *extra,
    ]
    return ("\n".join(lines) + "\n").encode("utf-8")


def remote_url(host: str, path: str, directory: bool = False) -> str:
    encoded = quote(path.strip("/"), safe="/")
    suffix = "/" if directory else ""
    return f"ftp://{host}/{encoded}{suffix}"


def list_directory(host: str, username: str, password: str, path: str):
    config = curl_config(username, password, [f'url = "{remote_url(host, path, directory=True)}"'])
    result = subprocess.run(["curl", "--config", "-"], input=config, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
    if result.returncode == 9 and path.strip("/").startswith("public_html/"):
        ftp = connect_control(host, username, password)
        try:
            ftp.sendcmd(f"SITE CHMOD 755 {path}")
        finally:
            try:
                ftp.quit()
            except (ftplib.Error, OSError, EOFError):
                ftp.close()
        result = subprocess.run(["curl", "--config", "-"], input=config, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=False)
    if result.returncode != 0:
        detail = result.stderr.decode("utf-8", "replace").strip()
        raise RuntimeError(f"curl failed for {path}: {detail}")
    for raw_line in result.stdout.decode("utf-8", "replace").splitlines():
        match = LISTING_RE.match(raw_line.strip())
        if not match:
            continue
        name = match.group("name")
        if name in {".", ".."}:
            continue
        entry_type = match.group("type")
        if entry_type == "l":
            continue
        yield name, entry_type, int(match.group("size"))


def collect_remote(host: str, username: str, password: str, root: str):
    files: list[tuple[str, int]] = []
    directories: list[str] = []
    pending = [root.strip("/")]
    while pending:
        directory = pending.pop()
        directories.append(directory)
        for name, entry_type, size in list_directory(host, username, password, directory):
            path = str(PurePosixPath(directory) / name)
            if entry_type == "d":
                pending.append(path)
            elif entry_type == "-":
                files.append((path, size))
        if len(directories) % 50 == 0:
            print(f"Scanned {len(directories)} directories and found {len(files)} files", flush=True)
    return files, directories


def backup(host: str, username: str, password: str, root: str, local_dir: Path):
    files, directories = collect_remote(host, username, password, root)
    local_dir.mkdir(parents=True, exist_ok=True)
    extra = ["create-dirs"]
    root_prefix = PurePosixPath(root.strip("/"))
    for remote_path, _ in files:
        relative = PurePosixPath(remote_path).relative_to(root_prefix)
        output = (local_dir / Path(relative.as_posix())).resolve()
        extra.extend([
            f'url = "{remote_url(host, remote_path)}"',
            f'output = "{output}"',
        ])
    print(f"Downloading {len(files)} files from {len(directories)} directories", flush=True)
    config = curl_config(username, password, extra)
    result = subprocess.run(["curl", "--config", "-"], input=config, check=False)
    if result.returncode != 0:
        raise RuntimeError("Encrypted backup download failed")
    actual_size = sum(path.stat().st_size for path in local_dir.rglob("*") if path.is_file())
    return len(files), actual_size


def purge(host: str, username: str, password: str, root: str):
    normalized_root = root.strip("/")
    if normalized_root != "public_html":
        raise RuntimeError("Refusing to purge anything other than public_html")
    files, directories = collect_remote(host, username, password, normalized_root)
    ftp = connect_control(host, username, password)
    try:
        for remote_path, _ in files:
            ftp.delete(remote_path)
        for directory in sorted(
            (item for item in directories if item != normalized_root),
            key=lambda item: len(PurePosixPath(item).parts),
            reverse=True,
        ):
            ftp.rmd(directory)
    finally:
        try:
            ftp.quit()
        except (ftplib.Error, OSError, EOFError):
            ftp.close()
    return len(files), len(directories) - 1


def connect_control(host: str, username: str, password: str) -> ftplib.FTP_TLS:
    ftp = ftplib.FTP_TLS(timeout=60)
    ftp.connect(host, 21)
    ftp.login(username, password)
    return ftp


def ensure_remote_dir(ftp: ftplib.FTP_TLS, remote_dir: str) -> None:
    current = PurePosixPath("/")
    for part in PurePosixPath(remote_dir).parts:
        if part == "/":
            continue
        current /= part
        try:
            ftp.mkd(str(current))
        except ftplib.error_perm as error:
            if not str(error).startswith("550"):
                raise


def upload(host: str, username: str, password: str, root: str, local_dir: Path):
    local_files = sorted(path for path in local_dir.rglob("*") if path.is_file())
    ftp = connect_control(host, username, password)
    try:
        ensure_remote_dir(ftp, root)
        for directory in sorted((path for path in local_dir.rglob("*") if path.is_dir()), key=lambda path: len(path.parts)):
            relative = directory.relative_to(local_dir).as_posix()
            ensure_remote_dir(ftp, str(PurePosixPath(root) / relative))
    finally:
        try:
            ftp.quit()
        except (ftplib.Error, OSError, EOFError):
            ftp.close()

    extra: list[str] = []
    for local_path in local_files:
        relative = local_path.relative_to(local_dir).as_posix()
        extra.extend([
            f'url = "{remote_url(host, str(PurePosixPath(root) / relative))}"',
            f'upload-file = "{local_path.resolve()}"',
        ])
    print(f"Uploading {len(local_files)} files through encrypted FTPS", flush=True)
    config = curl_config(username, password, extra)
    result = subprocess.run(["curl", "--config", "-"], input=config, check=False)
    if result.returncode != 0:
        raise RuntimeError("Encrypted upload failed")
    total_size = sum(path.stat().st_size for path in local_files)
    return len(local_files), total_size


def upload_bytes(host: str, username: str, password: str, remote_path: str, content: bytes) -> None:
    read_fd, write_fd = os.pipe()
    try:
        process = subprocess.Popen(
            ["curl", "--config", f"/dev/fd/{read_fd}", "--upload-file", "-", remote_url(host, remote_path)],
            stdin=subprocess.PIPE,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
            pass_fds=(read_fd,),
        )
        os.close(read_fd)
        read_fd = -1
        os.write(write_fd, curl_config(username, password, []))
        os.close(write_fd)
        write_fd = -1
        _, stderr = process.communicate(input=content)
        if process.returncode != 0:
            raise RuntimeError(f"Encrypted config upload failed: {stderr.decode('utf-8', 'replace').strip()}")
    finally:
        if read_fd >= 0:
            os.close(read_fd)
        if write_fd >= 0:
            os.close(write_fd)


def php_string(value: str) -> str:
    return "'" + value.replace("\\", "\\\\").replace("'", "\\'") + "'"


def install_contact_config(host: str, username: str, password: str) -> None:
    smtp_password = getpass.getpass("SMTP password: ")
    values = {
        "smtp_host": "s3.cyber-folks.pl",
        "smtp_port": "465",
        "smtp_username": "form@timzy.app",
        "smtp_password": smtp_password,
        "smtp_from": "form@timzy.app",
        "contact_to": "hello@timzy.app",
        "captcha_secret": secrets.token_hex(32),
    }
    lines = ["<?php", "return ["]
    for key, value in values.items():
        rendered = value if key == "smtp_port" else php_string(value)
        lines.append(f"    {php_string(key)} => {rendered},")
    lines.extend(["];", ""])
    upload_bytes(host, username, password, "public_html/.private/timzy-contact-config.php", "\n".join(lines).encode("utf-8"))


def cleanup_diagnostics(host: str, username: str, password: str) -> int:
    exact_files = [
        "timzy-contact-config.php",
        "timzy-config-location-test.txt",
        "public_html/.private/timzy-config-location-test.txt",
    ]
    removed = 0
    ftp = connect_control(host, username, password)
    try:
        for path in exact_files:
            try:
                ftp.delete(path)
                removed += 1
            except ftplib.error_perm as error:
                if not str(error).startswith("550"):
                    raise
    finally:
        try:
            ftp.quit()
        except (ftplib.Error, OSError, EOFError):
            ftp.close()
    return removed


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("action", choices=["inventory", "backup", "purge", "upload", "install-config", "cleanup-diagnostics"])
    parser.add_argument("--host", default="s3.cyber-folks.pl")
    parser.add_argument("--username", default="piotr@timzy.app")
    parser.add_argument("--remote-root", default="public_html")
    parser.add_argument("--local-dir", type=Path)
    args = parser.parse_args()

    if args.action in {"backup", "upload"} and args.local_dir is None:
        parser.error("--local-dir is required for backup and upload")

    password = getpass.getpass("FTPS password: ")
    if args.action == "inventory":
        files, directories = collect_remote(args.host, args.username, password, args.remote_root)
        size = sum(item[1] for item in files)
        print(f"Remote inventory: {len(files)} files, {len(directories)} directories, {size / 1024 / 1024:.1f} MB")
    elif args.action == "backup":
        files, size = backup(args.host, args.username, password, args.remote_root, args.local_dir)
        print(f"Backup complete: {files} files, {size / 1024 / 1024:.1f} MB")
    elif args.action == "purge":
        files, directories = purge(args.host, args.username, password, args.remote_root)
        print(f"Purge complete: removed {files} files and {directories} directories from public_html")
    elif args.action == "install-config":
        install_contact_config(args.host, args.username, password)
        print("Private contact configuration installed")
    elif args.action == "cleanup-diagnostics":
        removed = cleanup_diagnostics(args.host, args.username, password)
        print(f"Diagnostic cleanup complete: removed {removed} temporary files")
    else:
        files, size = upload(args.host, args.username, password, args.remote_root, args.local_dir)
        print(f"Upload complete: {files} files, {size / 1024 / 1024:.1f} MB")


if __name__ == "__main__":
    main()
