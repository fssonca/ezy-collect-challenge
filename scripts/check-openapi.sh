#!/bin/sh
set -eu

FILE="${1:-/workspace/openapi.yaml}"

test -s "${FILE}"
grep -q "/payments" "${FILE}"
grep -q "Idempotency-Key" "${FILE}"
