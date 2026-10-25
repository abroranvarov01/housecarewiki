#!/usr/bin/env bash
# Same as deploy.sh, but answers the server's SSH password prompts automatically
# (works without a TTY, e.g. from Claude Code's "!" runner).
#   VPS_PASS='root password' ./deploy/deploy-with-password.sh
set -euo pipefail
cd "$(dirname "$0")/.."
if [ -z "${VPS_PASS:-}" ]; then
  read -r -s -p "root password for ${VPS_HOST:-72.62.134.148}: " VPS_PASS; echo
fi
export VPS_PASS
exec /usr/bin/expect -c '
  set timeout -1
  spawn ./deploy/deploy.sh
  expect {
    -re "(?i)password:" { send -- "$env(VPS_PASS)\r"; exp_continue }
    eof
  }
  lassign [wait] pid spawnid os_error exit_code
  exit $exit_code
'
