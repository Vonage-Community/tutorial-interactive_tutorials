#!/bin/bash

URL=$1
CONFIG_FILE="tutorial-config.json"

# Ensure URL is passed as an argument
if [ -z "$1" ]; then
    echo "Error: URL must be provided as a parameter. Aborting."
    exit 1
fi

# Check if CONFIG_FILE exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: Configuration file $CONFIG_FILE not found. Aborting."
    exit 1
fi

# Read JSON configuration
SLUG=$(jq -r '.slug' "$CONFIG_FILE")
VERSION=$(jq -r '.version' "$CONFIG_FILE")
FILES=$(jq -r '.files[]' "$CONFIG_FILE")
OPEN_FILE=$(jq -r '.openFile' "$CONFIG_FILE")

# Create files from the "files" array
for FILE in $FILES; do
    if [ ! -f "$FILE" ]; then
        touch "$FILE"
        echo "Created file: $FILE"
    else
        echo "File already exists: $FILE"
    fi
done

# Update settings.json using a temporary file
SETTINGS_FILE=".vscode/settings.json"
if [ -f "$SETTINGS_FILE" ]; then
    TEMP_FILE=$(mktemp)
    sed "s|\"vs-browser.url\": \".*\"|\"vs-browser.url\": \"$URL\"|" "$SETTINGS_FILE" > "$TEMP_FILE" && mv "$TEMP_FILE" "$SETTINGS_FILE"
    echo "Updated $SETTINGS_FILE with URL: $URL"
else
    echo "$SETTINGS_FILE not found."
fi

# Update ofos.json using a temporary file
OFOS_FILE=".vscode/ofos.json"
if [ -f "$OFOS_FILE" ]; then
    TEMP_FILE=$(mktemp)
    sed "s|<FILE>|$OPEN_FILE|" "$OFOS_FILE" > "$TEMP_FILE" && mv "$TEMP_FILE" "$OFOS_FILE"
    echo "Updated $OFOS_FILE with openFile: $OPEN_FILE"
else
    echo "$OFOS_FILE not found."
fi