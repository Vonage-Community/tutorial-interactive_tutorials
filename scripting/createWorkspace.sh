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
CAPABILITIES=$(jq -r '.capabilities[]' "$CONFIG_FILE")
PANELS=$(jq -r '.panels[]' "$CONFIG_FILE")

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
    FILES_ARRAY=$(printf '"%s",' $FILES)
    FILES_ARRAY="[${FILES_ARRAY%,}]"
    sed "s|<FILES>|$FILES_ARRAY|" "$OFOS_FILE" > "$TEMP_FILE" && mv "$TEMP_FILE" "$OFOS_FILE"
    echo "Updated $OFOS_FILE with files: $FILES_ARRAY"
else
    echo "$OFOS_FILE not found."
fi

# Update capabilities.js using a temporary file
CAPABILITIES_FILE=".vscode/capabilities.js"
if [ -f "$CAPABILITIES_FILE" ]; then
    TEMP_FILE=$(mktemp)
    CAPABILITIES_ARRAY=$(printf '"%s",' $CAPABILITIES)
    CAPABILITIES_ARRAY="[${CAPABILITIES_ARRAY%,}]"
    sed "s|<CAPABILITIES>|$CAPABILITIES_ARRAY|" "$CAPABILITIES_FILE" > "$TEMP_FILE" && mv "$TEMP_FILE" "$CAPABILITIES_FILE"
    echo "Updated $CAPABILITIES_FILE with: $CAPABILITIES"
else
    echo "$CAPABILITIES_FILE not found."
fi

# Update tasks.json using a temporary file
if echo "${PANELS[@]}" | grep -q "browser"; then
    TASKS='["ExportEnv", "OpenContentView", "ConfigurePreview", "OpenTerminal", "EnableCapabilities", "CleanUp", "OpenPreviewView"]' 
else
    TASKS='["ExportEnv", "OpenContentView", "OpenTerminal", "EnableCapabilities", "CleanUp"]'
fi

TASKS_FILE=".vscode/tasks.json"
if [ -f "$TASKS_FILE" ]; then
    TEMP_FILE=$(mktemp)
    sed "s|<TASKS>|$TASKS|" "$TASKS_FILE" > "$TEMP_FILE" && mv "$TEMP_FILE" "$TASKS_FILE"
    echo "Updated $TASKS_FILE with tasks: $TASKS"
else
    echo "$TASKS_FILE not found."
fi
