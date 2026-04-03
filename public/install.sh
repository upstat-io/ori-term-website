#!/bin/sh
# ori-term installer — https://oriterm.com
# Usage: curl -fsSL https://oriterm.com/install.sh | sh
set -e

REPO="upstat-io/ori-term"
INSTALL_DIR="${ORITERM_INSTALL_DIR:-$HOME/.local/bin}"

main() {
    detect_platform
    get_latest_version
    download_and_install
    print_success
}

detect_platform() {
    OS="$(uname -s)"
    ARCH="$(uname -m)"

    case "$OS" in
        Linux)  PLATFORM="linux" ;;
        Darwin) PLATFORM="macos" ;;
        MINGW*|MSYS*|CYGWIN*)
            err "Windows detected. Download the .zip from https://github.com/$REPO/releases/latest"
            ;;
        *) err "Unsupported OS: $OS" ;;
    esac

    case "$ARCH" in
        x86_64|amd64)   ARCH="x86_64" ;;
        aarch64|arm64)   ARCH="aarch64" ;;
        *) err "Unsupported architecture: $ARCH" ;;
    esac

    # Validate platform/arch combo has a release
    case "${PLATFORM}-${ARCH}" in
        linux-x86_64|macos-aarch64) ;;
        macos-x86_64)
            err "macOS x86_64 builds are not available yet. Use Rosetta 2 with the aarch64 build."
            ;;
        *)
            err "No pre-built binary for ${PLATFORM}-${ARCH}. Build from source: https://github.com/$REPO"
            ;;
    esac

    log "Platform: ${PLATFORM}-${ARCH}"
}

get_latest_version() {
    log "Fetching latest release..."

    # Use GitHub API to get the most recent release (including pre-releases)
    if command -v curl >/dev/null 2>&1; then
        VERSION=$(curl -fsSL "https://api.github.com/repos/$REPO/releases?per_page=1" \
            | grep '"tag_name"' | head -1 | sed 's/.*"tag_name": *"//;s/".*//')
    elif command -v wget >/dev/null 2>&1; then
        VERSION=$(wget -qO- "https://api.github.com/repos/$REPO/releases?per_page=1" \
            | grep '"tag_name"' | head -1 | sed 's/.*"tag_name": *"//;s/".*//')
    else
        err "curl or wget is required"
    fi

    if [ -z "$VERSION" ]; then
        err "Failed to fetch latest version. Check https://github.com/$REPO/releases"
    fi

    log "Latest version: $VERSION"
}

download_and_install() {
    ASSET="oriterm-${VERSION}-${PLATFORM}-${ARCH}.tar.gz"
    URL="https://github.com/$REPO/releases/download/${VERSION}/${ASSET}"

    TMPDIR=$(mktemp -d)
    trap 'rm -rf "$TMPDIR"' EXIT

    log "Downloading $ASSET..."
    if command -v curl >/dev/null 2>&1; then
        curl -fSL --progress-bar "$URL" -o "$TMPDIR/$ASSET"
    else
        wget --show-progress -qO "$TMPDIR/$ASSET" "$URL"
    fi

    log "Extracting..."
    tar xzf "$TMPDIR/$ASSET" -C "$TMPDIR"

    # Find the binary in the extracted files
    BINARY=$(find "$TMPDIR" -name 'oriterm' -type f | head -1)
    if [ -z "$BINARY" ]; then
        BINARY=$(find "$TMPDIR" -name 'oriterm.exe' -type f | head -1)
    fi
    if [ -z "$BINARY" ]; then
        err "Could not find oriterm binary in archive"
    fi

    mkdir -p "$INSTALL_DIR"
    chmod +x "$BINARY"
    mv "$BINARY" "$INSTALL_DIR/oriterm"

    log "Installed to $INSTALL_DIR/oriterm"
}

print_success() {
    # Check if install dir is in PATH
    case ":$PATH:" in
        *":$INSTALL_DIR:"*) ;;
        *)
            echo ""
            warn "$INSTALL_DIR is not in your PATH."
            echo "  Add it by running:"
            echo ""
            echo "    export PATH=\"$INSTALL_DIR:\$PATH\""
            echo ""
            echo "  Or add that line to your ~/.bashrc, ~/.zshrc, or ~/.profile."
            ;;
    esac

    echo ""
    echo "  ori-term installed successfully!"
    echo ""
    echo "  Run it:"
    echo "    oriterm"
    echo ""
    echo "  Verify:"
    echo "    oriterm --version"
    echo ""
}

log() {
    echo "  [ori-term] $1"
}

warn() {
    echo "  [ori-term] WARNING: $1"
}

err() {
    echo "  [ori-term] ERROR: $1" >&2
    exit 1
}

main "$@"
