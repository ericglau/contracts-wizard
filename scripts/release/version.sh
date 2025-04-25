#!/usr/bin/env bash

set -euo pipefail

changeset version

scripts/release/format-changelog.js
