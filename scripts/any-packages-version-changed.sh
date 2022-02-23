#!/usr/bin/env bash

if [[ $(git diff --name-only packages | wc -l) -eq 0 ]]; then
  exit 1
else
  exit 0
fi
