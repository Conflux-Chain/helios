#!/usr/bin/env bash

echo $(git diff --name-only packages | wc -l)

if [[ $(git diff --name-only packages | wc -l) -eq 0 ]]; then
  exit 0
else
  exit 1
fi
