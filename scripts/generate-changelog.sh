#!/bin/bash
# Generate changelog.json from ori_term git log during build.
# Filters to meaningful conventional commits (feat, fix, refactor, perf, docs).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WEBSITE_DIR="$(dirname "$SCRIPT_DIR")"
REPO_ROOT="$WEBSITE_DIR/../ori_term"
OUTPUT="$WEBSITE_DIR/public/changelog.json"

LIMIT=150

if [ ! -d "$REPO_ROOT/.git" ]; then
  echo "Warning: ori_term repo not found at $REPO_ROOT, generating empty changelog"
  echo "[]" > "$OUTPUT"
  exit 0
fi

cd "$REPO_ROOT"

echo "Generating changelog from ori_term git log..."

echo "[" > "$OUTPUT"

count=0
first=true

while IFS='|' read -r full_hash date subject; do
    if [ "$count" -ge "$LIMIT" ]; then
        break
    fi

    hash="${full_hash:0:7}"

    case "$subject" in
        Merge*) continue ;;
    esac

    if echo "$subject" | grep -qE '^[a-z]+(\([^)]+\))?!?: '; then
        type=$(echo "$subject" | sed -E 's/^([a-z]+)(\([^)]+\))?!?: .*/\1/')
        scope=$(echo "$subject" | sed -E 's/^[a-z]+(\(([^)]+)\))?!?: .*/\2/')
        message=$(echo "$subject" | sed -E 's/^[a-z]+(\([^)]+\))?!?: //')
    else
        continue
    fi

    case "$type" in
        feat|fix|refactor|perf|docs) ;;
        *) continue ;;
    esac

    message=$(echo "$message" | sed 's/\\/\\\\/g; s/"/\\"/g')

    if [ "$first" = true ]; then
        first=false
    else
        echo "," >> "$OUTPUT"
    fi

    if [ -n "$scope" ]; then
        printf '  {"date": "%s", "type": "%s", "scope": "%s", "message": "%s", "hash": "%s"}' \
            "$date" "$type" "$scope" "$message" "$hash" >> "$OUTPUT"
    else
        printf '  {"date": "%s", "type": "%s", "message": "%s", "hash": "%s"}' \
            "$date" "$type" "$message" "$hash" >> "$OUTPUT"
    fi

    count=$((count + 1))
done < <(git log --pretty=format:'%H|%ad|%s' --date=short -n 500)

echo "" >> "$OUTPUT"
echo "]" >> "$OUTPUT"

echo "Generated changelog with $count entries -> $OUTPUT"
