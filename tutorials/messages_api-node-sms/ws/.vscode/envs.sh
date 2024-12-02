#!/bin/bash

# Process YML_ variables
env | grep '^YML_' | while IFS='=' read -r name value; do
    new_name=${name#YML_}
    export $new_name=\"$value\"
done

# Write VONAGE_ variables to .env
env | grep -o '^VONAGE_[^=]*' | while read varname; do
    echo "$varname=${!varname}" >> .env
done