#!/usr/bin/env bash
# Deploy Life OS to Vercel and attach a Cloudflare subdomain.
# Usage: VERCEL_TOKEN=... ./scripts/deploy-vercel.sh life.yourdomain.com
set -euo pipefail

: "${VERCEL_TOKEN:?Set VERCEL_TOKEN}"
DOMAIN="${1:?Usage: deploy-vercel.sh <subdomain>}"
PROJECT="${VERCEL_PROJECT:-life-os}"
VERCEL=(pnpm dlx vercel@latest)

echo "→ linking $PROJECT"
"${VERCEL[@]}" link --yes --project "$PROJECT" --token "$VERCEL_TOKEN"

echo "→ pushing env from .env.vercel (APP_URL=https://$DOMAIN)"
while IFS= read -r line || [ -n "$line" ]; do
  case "$line" in ''|'#'*) continue ;; esac
  key="${line%%=*}"
  value="${line#*=}"
  if [ "$key" = "APP_URL" ]; then value="https://$DOMAIN"; fi
  if [ -z "$value" ]; then continue; fi
  "${VERCEL[@]}" env rm "$key" production --yes --token "$VERCEL_TOKEN" >/dev/null 2>&1 || true
  printf '%s\n' "$value" | "${VERCEL[@]}" env add "$key" production --token "$VERCEL_TOKEN" >/dev/null
  echo "   $key"
done < .env.vercel

echo "→ deploying production"
URL=$("${VERCEL[@]}" deploy --prod --yes --token "$VERCEL_TOKEN" | tail -1)
echo "   $URL"

echo "→ attaching $DOMAIN"
"${VERCEL[@]}" domains add "$DOMAIN" "$PROJECT" --token "$VERCEL_TOKEN" || true

cat <<EOF

Done.

Cloudflare record:
  Type:  CNAME
  Name:  ${DOMAIN%%.*}
  Value: cname.vercel-dns.com
  Proxy: DNS only (grey cloud)

Then Vercel → Settings → Domains → Verify.
APP_URL is already set to https://$DOMAIN.
EOF
