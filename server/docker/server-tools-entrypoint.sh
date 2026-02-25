#!/bin/sh
set -eu

# Maven Docker images export MAVEN_CONFIG=/root/.m2, but the Apache mvnw script
# treats MAVEN_CONFIG as CLI args. Unset it so mvnw works correctly inside this container.
unset MAVEN_CONFIG

exec "$@"
