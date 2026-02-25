#!/bin/sh
set -eu

OUTPUT_PATH="${1:-/workspace/openapi.yaml}"

curl --fail --silent --show-error \
  --retry 30 \
  --retry-all-errors \
  --retry-delay 2 \
  http://server:8080/v3/api-docs.yaml \
  -o "${OUTPUT_PATH}"

test -s "${OUTPUT_PATH}"
