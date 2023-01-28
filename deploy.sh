#!/usr/bin/env sh

# abort on errors
set -e

# build
pnpm run build

# navigate into the build output directory
cd dist

# place .nojekyll to bypass Jekyll processing
echo > .nojekyll


git init
git checkout -B main
git add -A
git commit -m 'deploy'


git push -f git@github.com:IgorAtilar/espeon.git main:gh-pages

cd -