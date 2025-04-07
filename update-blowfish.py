#!/usr/bin/env python3
import json
import os
import shutil
import stat
import subprocess
import sys
import urllib.request


def make_writable(path):
    for root, dirs, files in os.walk(path):
        for file in files:
            file_path = os.path.join(root, file)
            os.chmod(file_path, stat.S_IWRITE | stat.S_IREAD)


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    theme_dir = os.path.join(script_dir, "themes", "blowfish")

    # Get latest version from GitHub
    try:
        with urllib.request.urlopen(
            "https://raw.githubusercontent.com/nunocoracao/blowfish/main/package.json"
        ) as response:
            data = json.loads(response.read().decode())
            latest_version = data.get("version", "")
    except Exception:
        sys.exit("Failed to fetch latest version information.")

    # Get current version
    current_version = "N/A"
    if os.path.exists(theme_dir):
        package_path = os.path.join(theme_dir, "package.json")
        if os.path.exists(package_path):
            with open(package_path, "r") as f:
                data = json.loads(f.read())
                current_version = data.get("version", "N/A")

    if current_version == latest_version:
        print("Already up-to-date.")
        return

    if os.path.exists(theme_dir):
        if os.name == "nt":
            git_dir = os.path.join(theme_dir, ".git")
            if os.path.exists(git_dir):
                make_writable(git_dir)
            shutil.rmtree(theme_dir)
        else:
            shutil.rmtree(theme_dir)

    subprocess.run(
        [
            "git",
            "clone",
            "--quiet",
            "--filter=blob:none",
            "--depth=1",
            "--no-checkout",
            "--sparse",
            "https://github.com/nunocoracao/blowfish",
            theme_dir,
        ],
        check=True,
    )

    os.chdir(theme_dir)
    subprocess.run(["git", "sparse-checkout", "init", "--no-cone"], check=True)
    subprocess.run(
        [
            "git",
            "sparse-checkout",
            "set",
            "/*",
            "!/exampleSite/*",
            "!/images/*",
            "!/assets/img",
            "!/*.png",
            "!/static/*",
        ],
        check=True,
    )
    subprocess.run(["git", "checkout"], check=True)
    shutil.rmtree(os.path.join(theme_dir, ".git"))

    with open("package.json", "r") as f:
        data = json.loads(f.read())
        new_version = data.get("version", "unknown")

    print(f"Successfully updated Blowfish from {current_version} to {new_version}")


if __name__ == "__main__":
    main()
