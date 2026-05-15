#!/usr/bin/env bash
# Build the site and publish dist/ to the `gh-pages` branch on origin.
#
# MIT GHES has GitHub Actions disabled, so we can't run a workflow on push.
# Instead we build locally and push the static output to a dedicated branch
# that GHES Pages serves via "Deploy from a branch".
#
# In repo Settings -> Pages, set Source = "Deploy from a branch", branch =
# `gh-pages`, folder = `/(root)`. The site will be served at:
#   https://github.mit.edu/pages/ruonan/hangroup-site/
#
# Note: this force-pushes `gh-pages` every run. That branch is a build-output
# mirror — never commit hand-written changes to it.

set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Building site"
npm run build

WORKTREE_DIR="$(mktemp -d)/gh-pages"
echo "==> Preparing gh-pages worktree at $WORKTREE_DIR"
git worktree add --orphan -B gh-pages "$WORKTREE_DIR" >/dev/null

# Clean the worktree (orphan branch starts empty, but be defensive in case
# git ever changes that behavior).
find "$WORKTREE_DIR" -mindepth 1 -maxdepth 1 ! -name '.git' -exec rm -rf {} +

echo "==> Copying dist/ into worktree"
cp -R dist/. "$WORKTREE_DIR/"

# .nojekyll tells GHES Pages to skip Jekyll processing — otherwise it would
# silently drop files and folders whose names start with an underscore
# (Astro emits /_astro/* for its asset bundles).
touch "$WORKTREE_DIR/.nojekyll"

echo "==> Committing and force-pushing gh-pages"
git -C "$WORKTREE_DIR" add --all
git -C "$WORKTREE_DIR" -c user.name="deploy" -c user.email="deploy@local" \
  commit -m "deploy: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >/dev/null
git -C "$WORKTREE_DIR" push --force origin gh-pages

echo "==> Cleaning up worktree"
git worktree remove --force "$WORKTREE_DIR"
git branch -D gh-pages 2>/dev/null || true

echo ""
echo "Done. Site will be live at:"
echo "  https://github.mit.edu/pages/ruonan/hangroup-site/"
echo "(GHES Pages takes ~30–60s to publish after the push.)"
