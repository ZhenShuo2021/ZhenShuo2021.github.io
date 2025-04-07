#!/bin/sh

set -e

# Check if jq is installed
if ! command -v jq >/dev/null 2>&1; then
  echo "Command jq not found. Please install jq and try again."
  exit 1
fi

script_dir="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
theme_dir="$script_dir/themes/blowfish"
latest_version=$(curl -s https://raw.githubusercontent.com/nunocoracao/blowfish/main/package.json | jq -r '.version')

if [ -f "$theme_dir/package.json" ]; then
  local_version=$(jq -r '.version' "$theme_dir/package.json")
else
  local_version="N/A"
fi

if [ "$local_version" = "$latest_version" ]; then
  echo "Already up-to-date."
  exit 0
else
  rm -rf "$theme_dir"

  git clone -q --filter=blob:none --depth=1 --no-checkout --sparse https://github.com/nunocoracao/blowfish "$theme_dir"
  cd "$theme_dir"
  git sparse-checkout init --no-cone
  git sparse-checkout set '/*' '!/exampleSite/*' '!/images/*' '!/assets/img' '!/*.png' '!/static/*'
  git checkout
  rm -rf "$theme_dir/.git"

  new_version=$(jq -r '.version' package.json)
  echo "Successfully updated Blowfish from $local_version to $new_version"
fi
