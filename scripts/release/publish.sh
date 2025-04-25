#!/usr/bin/env bash

set -euo pipefail

npm run:core solidity publish
npm run:core cairo publish
npm run:core stellar publish
npm run:core stylus publish
