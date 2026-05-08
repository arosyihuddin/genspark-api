#!/bin/bash
# Wrapper script to call Genspark API via curl
# Reads payload from stdin to avoid shell escaping issues

SESSION_ID="$1"

curl -s -N -X POST https://www.genspark.ai/api/agent/ask_proxy \
  -H "Content-Type: application/json" \
  -H "Cookie: session_id=${SESSION_ID}" \
  -H "Origin: https://www.genspark.ai" \
  -H "Referer: https://www.genspark.ai/" \
  -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36" \
  -d @-
