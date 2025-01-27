#!/bin/sh

# Change VS Browser Column to "Three" and URL for 2nd Browser
SETTINGSFILE="./.vscode/settings.json"
if [ -f "$SETTINGSFILE" ]; then
    sed -i.bak 's|"vs-browser\.url": ".*"|"vs-browser.url": "https://www.example.com"|' \
        "$SETTINGSFILE"
    rm -f "${SETTINGSFILE}.bak"
else
    echo "File not found: $SETTINGSFILE"
fi