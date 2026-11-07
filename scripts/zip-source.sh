#!/bin/sh
set -e

cd "$(dirname "$0")/.."

version=$(node -p "require('./public/manifest.json').version")
output="simple-new-tab-$version-source.zip"

rm -f "$output"

# everything that isn't gitignored, except for images that are only for the README and store listings
git ls-files -co --exclude-standard |
	grep -v '^docs/' |
	while read -r file; do
		if [ -f "$file" ]; then echo "$file"; fi
	done |
	zip -q "$output" -@

echo "Created $output"
