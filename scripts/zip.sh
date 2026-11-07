#!/bin/sh
set -e

cd "$(dirname "$0")/.."
pnpm build

version=$(node -p "require('./dist/manifest.json').version")
output="simple-new-tab-$version.zip"

rm -f "$output"
(cd dist && zip -qr "../$output" . -x '*.DS_Store')
echo "Created $output"
