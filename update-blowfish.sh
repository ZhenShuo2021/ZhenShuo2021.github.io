#!/bin/sh

set -e

script_dir="$( cd -- "$(dirname "$0")" >/dev/null 2>&1 ; pwd -P )"
theme_dir="$script_dir/themes/blowfish"
latest_version=$(curl -s https://api.github.com/repos/nunocoracao/blowfish/releases/latest | grep -o '"tag_name": "[^"]*' | cut -d ' ' -f 2 | tr -d '"')

if [ -d "$theme_dir" ]; then
  cd $theme_dir
  local_version=$(git tag --sort=v:refname | tail -1)
  [ -z "$local_version" ] && local_version="N/A"
  cd $theme_dir/../..
else
  local_version="N/A"
fi

if [ "$local_version" = "$latest_version" ]; then
  echo "Already up-to-date."
  exit 0
fi

rm -rf $theme_dir

git clone -q --filter=blob:none --depth=1 --no-checkout --sparse https://github.com/nunocoracao/blowfish $theme_dir
cd $theme_dir
git sparse-checkout init --no-cone
git sparse-checkout set '/*' '!/exampleSite/*' '!/images/*' '!/assets/img' '!/*.png' '!/static/*'
git checkout

blowfish_version=$(git tag --sort=v:refname | tail -1)
echo "Successfully updated Blowfish from $local_version to $blowfish_version"
