#!/bin/bash

# commited files not yet in main
newFiles=$(git diff --diff-filter=A --name-only main HEAD | grep -E '\.(ts)$')

if [[ -n $newFiles ]]; then
  yarn eslint -c .eslintrc-filenames $(echo $newFiles | xargs)
fi
