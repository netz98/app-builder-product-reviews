#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMPLATE_FILE="${ROOT_DIR}/mesh.json"
GENERATED_FILE="${ROOT_DIR}/mesh.generated.json"

NAMESPACE="${NAMESPACE:-$(aio config get runtime.namespace)}"

if [ -z "${NAMESPACE}" ]; then
  echo "Error: runtime namespace is empty. Run 'aio app use' or set NAMESPACE explicitly." >&2
  exit 1
fi

sed "s|{NAMESPACE}|${NAMESPACE}|g" "${TEMPLATE_FILE}" > "${GENERATED_FILE}"
aio api-mesh update "${GENERATED_FILE}"

echo "Mesh updated successfully for namespace: ${NAMESPACE}"
echo "Generated file: ${GENERATED_FILE}"
echo "Note: Do not commit ${GENERATED_FILE}."
