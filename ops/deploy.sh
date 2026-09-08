#!/usr/bin/env bash
set -Eeuo pipefail

VERSION="${1:-}"
SOURCE_DIR="${2:-}"

if [[ ! "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Invalid release version: $VERSION" >&2
  exit 64
fi

if [[ ! -d "$SOURCE_DIR" ]]; then
  echo "Source directory does not exist: $SOURCE_DIR" >&2
  exit 66
fi

APP_ROOT="${SRBASAR_FRONTEND_ROOT:-/var/www/clients/client2/web3/private/frontend}"
WEB_ROOT="${SRBASAR_FRONTEND_WEB_ROOT:-/var/www/clients/client2/web3/web}"
CURRENT_LINK="$APP_ROOT/current"
SHARED_DIR="$APP_ROOT/shared"
RELEASES_DIR="$APP_ROOT/releases"
STAGING_DIR="$RELEASES_DIR/.staging"
RELEASE_DIR="$RELEASES_DIR/$VERSION"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "The frontend deployment must run as root on the ISPConfig host." >&2
  exit 77
fi

if [[ ! -f "$SHARED_DIR/.env" ]]; then
  echo "Missing shared frontend environment: $SHARED_DIR/.env" >&2
  exit 78
fi

if [[ -e "$RELEASE_DIR" || -L "$RELEASE_DIR" ]]; then
  if [[ "$(readlink -f "$CURRENT_LINK" 2>/dev/null || true)" == "$RELEASE_DIR" ]]; then
    echo "Frontend release $VERSION is already active."
    exit 0
  fi
  echo "Release already exists: $RELEASE_DIR" >&2
  exit 79
fi

mkdir -p "$SHARED_DIR" "$RELEASES_DIR" "$STAGING_DIR"

staging_release="$STAGING_DIR/$VERSION.$$"
cleanup() {
  rm -rf -- "$staging_release"
}
trap cleanup EXIT

mkdir -p "$staging_release"
cp -a "$SOURCE_DIR/." "$staging_release/"
rm -f "$staging_release/.env"
ln -s "$SHARED_DIR/.env" "$staging_release/.env"

pushd "$staging_release" >/dev/null
npm ci --no-audit --no-fund
VITE_APP_VERSION="$VERSION" npm run build
popd >/dev/null

if [[ ! -s "$staging_release/dist/index.html" ]]; then
  echo "Frontend build did not produce dist/index.html" >&2
  exit 80
fi

rm -rf -- "$staging_release/node_modules"
find "$staging_release" -type d -exec chmod 755 {} +
find "$staging_release" -type f -exec chmod 644 {} +

mv -- "$staging_release" "$RELEASE_DIR"
trap - EXIT

if [[ ! -d "$WEB_ROOT" || -L "$WEB_ROOT" ]]; then
  echo "The ISPConfig web path must remain a directory: $WEB_ROOT" >&2
  exit 81
fi

mkdir -p "$WEB_ROOT/assets"
cp -a "$RELEASE_DIR/dist/assets/." "$WEB_ROOT/assets/"
for public_file in "$RELEASE_DIR/dist"/*; do
  if [[ -f "$public_file" && "$(basename "$public_file")" != "index.html" ]]; then
    install -m 644 "$public_file" "$WEB_ROOT/$(basename "$public_file")"
  fi
done

previous_index_target="$(readlink "$WEB_ROOT/index.html" 2>/dev/null || true)"
index_link="$WEB_ROOT/.index.html.next.$$"
ln -s "$RELEASE_DIR/dist/index.html" "$index_link"
mv -Tf -- "$index_link" "$WEB_ROOT/index.html"

current_link="$CURRENT_LINK.next.$$"
ln -s "$RELEASE_DIR" "$current_link"
if ! mv -Tf -- "$current_link" "$CURRENT_LINK"; then
  if [[ -n "$previous_index_target" ]]; then
    restore_link="$WEB_ROOT/.index.html.restore.$$"
    ln -s "$previous_index_target" "$restore_link"
    mv -Tf -- "$restore_link" "$WEB_ROOT/index.html"
  fi
  exit 82
fi

echo "Frontend release $VERSION is active at $CURRENT_LINK."
