#!/usr/bin/env bash
# scripts/update-architecture-map.sh
# Auto-generates context/architecture-map.md from the codebase.
# Preserves hand-maintained sections between <!-- BEGIN_MANUAL --> and <!-- END_MANUAL --> markers.
#
# Usage:
#   bash scripts/update-architecture-map.sh
#   (run from repo root, or via `npm run update-map`)

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MAP_FILE="$REPO_ROOT/context/architecture-map.md"

# ─── Helpers ────────────────────────────────────────────────────────────────

get_stack() {
  cd "$REPO_ROOT"
  local next react clerk prisma tailwind shadcn
  next=$(node -p "require('./package.json').dependencies['next'] || '??'" 2>/dev/null | tr -d '"' || echo "?")
  react=$(node -p "require('./package.json').dependencies['react'] || '??'" 2>/dev/null | tr -d '"' || echo "?")
  clerk=$(node -p "require('./package.json').dependencies['@clerk/nextjs'] || '??'" 2>/dev/null | tr -d '"' || echo "?")
  prisma=$(node -p "require('./package.json').dependencies['@prisma/client'] || '??'" 2>/dev/null | tr -d '"' || echo "?")
  tailwind=$(node -p "try { require('tailwindcss/package.json').version } catch(e) { '??' }" 2>/dev/null || echo "?")
  shadcn=$(node -p "require('./package.json').dependencies['shadcn'] || '??'" 2>/dev/null | tr -d '"' || echo "?")
  echo "**Stack:** Next.js ${next} · React ${react} · Tailwind ${tailwind} · shadcn/ui ${shadcn} · Clerk ${clerk} · Prisma ${prisma} · Vercel Blob · Yarn 4"
}

# ─── 1. Directory Tree ─────────────────────────────────────────────────────

generate_tree() {
  cd "$REPO_ROOT"
  echo '```'

  # Top-level files
  for f in $(find . -maxdepth 1 -type f \
    ! -name '.*' ! -name 'yarn.lock' ! -name 'package-lock.json' \
    ! -name 'tsconfig.tsbuildinfo' ! -name 'next-env.d.ts' \
    | sort); do
    echo "├── $(basename "$f")"
  done

  # app/ tree
  echo "├── app/"
  for f in $(find app -maxdepth 1 -type f | sort); do
    echo "│   ├── $(basename "$f")"
  done
  # app/editor
  echo "│   ├── editor/"
  echo "│   │   └── page.tsx"
  # app/sign-in, sign-up
  echo "│   ├── sign-in/[[...sign-in]]/page.tsx"
  echo "│   ├── sign-up/[[...sign-up]]/page.tsx"
  # app/api tree
  echo "│   └── api/"
  if [ -d app/api ]; then
    # Find all route.ts files under api/
    find app/api -name "route.ts" | sort | while read -r route_file; do
      local dir
      dir=$(dirname "$route_file" | sed 's|^app/api/||')
      local indent="│   │   "
      local path_parts
      IFS='/' read -ra path_parts <<< "$dir"
      for i in "${!path_parts[@]}"; do
        if [ $i -eq $((${#path_parts[@]}-1)) ]; then
          echo "${indent}├── ${path_parts[$i]}/route.ts"
        else
          echo "${indent}├── ${path_parts[$i]}/"
          indent="${indent}│   "
        fi
      done
    done
  fi

  # components/ tree
  echo "├── components/"
  find components -type f -name "*.tsx" ! -path "*/ui/*" | sort | while read -r f; do
    local rel="${f#components/}"
    local depth
    depth=$(echo "$rel" | tr -cd '/' | wc -c | tr -d ' ')
    local indent="├── "
    for ((i=0; i<depth; i++)); do indent="│   ${indent}"; done
    echo "${indent}$(basename "$f")"
  done
  echo "│   └── ui/                         # ⚠️ shadcn primitives — DO NOT MODIFY"
  find components/ui -maxdepth 1 -type f -name "*.tsx" | sort | while read -r f; do
    echo "│       └── $(basename "$f")"
  done

  # hooks/
  echo "├── hooks/"
  find hooks -type f | sort | while read -r f; do
    echo "│   └── $(basename "$f")"
  done

  # lib/
  echo "├── lib/"
  for f in $(find lib -maxdepth 1 -type f | sort); do
    echo "│   ├── $(basename "$f")"
  done
  echo "│   └── generated/                  # ⚠️ Auto-generated — DO NOT EDIT"

  # prisma/
  echo "├── prisma/"
  echo "│   ├── schema.prisma"
  [ -f prisma/seed.ts ] && echo "│   ├── seed.ts"
  echo "│   └── migrations/"

  # context/
  echo "└── context/"
  find context -maxdepth 1 -type f | sort | while read -r f; do
    echo "    ├── $(basename "$f")"
  done
  echo "└── feature-specs/"

  echo '```'
}

# ─── 2. Routes Table ───────────────────────────────────────────────────────

generate_routes() {
  cd "$REPO_ROOT"
  echo "| Route | File | Method | Auth | Purpose |"
  echo "|-------|------|--------|------|---------|"

  # Page routes
  find app -name "page.tsx" | sort | while read -r f; do
    local route
    route=$(echo "$f" | sed 's|^app||; s|/page\.tsx$||')
    [ -z "$route" ] && route="/"
    local auth="No"
    echo "$f" | grep -q "editor" && auth="Yes"
    local purpose="Page"
    echo "$f" | grep -q "sign-in" && purpose="Clerk sign-in"
    echo "$f" | grep -q "sign-up" && purpose="Clerk sign-up"
    echo "$f" | grep -q "editor" && purpose="Main editor workspace"
    echo "$f" | grep -q "app/page.tsx" && purpose="Redirect: → /editor or /sign-in"
    echo "| \`$route\` | \`$f\` | GET | $auth | $purpose |"
  done

  # API routes
  find app/api -name "route.ts" | sort | while read -r f; do
    local route
    route=$(echo "$f" | sed 's|^app||; s|/route\.tsx\?$||')
    local auth="Yes"
    # Detect exported functions (GET, POST, PATCH, PUT, DELETE)
    local methods=""
    grep -q "export.*function GET" "$f" 2>/dev/null && methods="${methods}GET "
    grep -q "export.*function POST" "$f" 2>/dev/null && methods="${methods}POST "
    grep -q "export.*function PATCH" "$f" 2>/dev/null && methods="${methods}PATCH "
    grep -q "export.*function PUT" "$f" 2>/dev/null && methods="${methods}PUT "
    grep -q "export.*function DELETE" "$f" 2>/dev/null && methods="${methods}DELETE "
    [ -z "$methods" ] && methods="GET"
    # Generate purpose from route path
    local purpose
    purpose="API: $(echo "$route" | sed -e 's|/api/||' -e 's|\[[^]]*\]||g' -e 's|/| → |g' -e 's| → $||' -e 's|^| |')"
    echo "| \`$route\` | \`$f\` | $methods | $auth | $purpose |"
  done
}

# ─── 3. Components Table ───────────────────────────────────────────────────

generate_components() {
  cd "$REPO_ROOT"
  echo "| File | Type | Purpose |"
  echo "|------|------|---------|"
  find components -name "*.tsx" ! -path "*/ui/*" | sort | while read -r f; do
    local rel="${f#components/}"
    local ctype="Client"
    grep -q '"use client"' "$f" 2>/dev/null || ctype="RSC"
    # Generate purpose from filename: replace hyphens with spaces, strip extension
    local purpose
    purpose=$(basename "$f" .tsx | tr '-' ' ')
    echo "| \`$f\` | $ctype | $purpose |"
  done
  echo "| \`components/ui/*.tsx\` | RSC | shadcn/ui v4 primitives (base-ui, not Radix) |"
}

# ─── 4. Hooks & Lib Table ─────────────────────────────────────────────────

generate_hooks_lib() {
  cd "$REPO_ROOT"
  echo "| File | Exports | Purpose |"
  echo "|------|---------|---------|"
  for f in hooks/*.ts hooks/*.tsx lib/*.ts lib/*.tsx; do
    [ -f "$f" ] || continue
    local exports
    exports=$(grep -oE 'export (default |const |function |type |interface |class )[a-zA-Z_]+' "$f" 2>/dev/null \
      | sed 's/export //g' | tr '\n' ', ' | sed 's/,$//')
    [ -z "$exports" ] && exports="(default)"
    local purpose
    purpose=$(basename "$f" .ts | sed 's/-/ /g')
    echo "| \`$f\` | $exports | $purpose |"
  done
}

# ─── 5. Data Model (Prisma) ───────────────────────────────────────────────

generate_prisma() {
  cd "$REPO_ROOT"
  local schema="prisma/schema.prisma"
  [ -f "$schema" ] || return

  echo '```'
  echo "Prisma → PostgreSQL"

  # Extract enums
  grep -A 10 "^enum " "$schema" | while read -r line; do
    if echo "$line" | grep -q "^enum "; then
      local name
      name=$(echo "$line" | awk '{print $2}')
      local values=""
      while IFS= read -r vline; do
        vline=$(echo "$vline" | xargs)
        [[ "$vline" == "}" ]] && break
        [ -n "$vline" ] && values="${values}${vline}, "
      done
      echo "Enum: $name { ${values%, } }"
    fi
  done

  echo ""

  # Extract models and fields
  awk '
    /^model / { model=$2; printf "Model: %s\n", model; next }
    /^}/ { model=""; next }
    model != "" && /^[[:space:]]+[a-zA-Z]/ {
      gsub(/^[[:space:]]+/, "")
      gsub(/@.*$/, "")
      gsub(/\?.*/, "")
      printf "  %s\n", $0
    }
  ' "$schema"

  echo ""
  echo "Relationships:"
  awk '
    /@relation/ {
      # Go back to find the model and field
      line = prev
      gsub(/^[[:space:]]+/, "", line)
      split(line, a, " ")
      field = a[1]
    }
    /^model / { model=$2 }
    /@relation\(/ {
      match($0, /fields:\s*\[([^\]]+)\]/, f)
      match($0, /references:\s*\[([^\]]+)\]/, r)
      if (f[1] != "" && r[1] != "") {
        printf "  %s.%s (%s) → %s.%s\n", model, field, f[1], $0, r[1]
      }
    }
    { prev = $0 }
  ' "$schema" 2>/dev/null

  echo '```'
}

# ─── 6. Environment Variables ──────────────────────────────────────────────

generate_env() {
  cd "$REPO_ROOT"
  local envs
  envs=$(grep -roh 'process\.env\.\(NEXT_PUBLIC_\)\?[A-Z_]*' \
    --include='*.ts' --include='*.tsx' --include='*.js' --include='*.mjs' \
    app/ lib/prisma.ts lib/utils.ts hooks/ proxy.ts 2>/dev/null \
    | sed 's/process\.env\.//' | grep -v '^NODE_ENV$' | sort -u)

  echo "| Variable | Used By |"
  echo "|----------|---------|"
  for var in $envs; do
    local files
    files=$(grep -rl "process\.env\.${var}" \
      --include='*.ts' --include='*.tsx' --include='*.js' --include='*.mjs' \
      app/ lib/prisma.ts lib/utils.ts hooks/ proxy.ts 2>/dev/null \
      | head -3 | sed -e 's|^|`|' -e 's|$|`|' | tr '\n' ',' | sed -e 's/,$//')
    echo "| \`$var\` | $files |"
  done
}

# ─── Main ──────────────────────────────────────────────────────────────────

cd "$REPO_ROOT"

# Collect manual sections
manual=""
if grep -q '<!-- BEGIN_MANUAL -->' "$MAP_FILE" 2>/dev/null; then
  manual=$(sed -n '/<!-- BEGIN_MANUAL -->/,/<!-- END_MANUAL -->/p' "$MAP_FILE")
fi

# Build the file
{
  cat <<'HEADER'
# Architecture Map

> Machine-readable project map. Update when files/folders change. Do not edit `components/ui/*` or `lib/generated/*`.
HEADER

  get_stack

  cat <<'TOKENS'

**Theme:** Dark-only. All tokens in `app/globals.css` → `@theme inline`. No hex overrides.

---
TOKENS

  echo ""
  echo "## Directory Tree"
  echo ""
  generate_tree

  echo ""
  echo "---"
  echo ""
  echo "## Routes"
  echo ""
  generate_routes

  echo ""
  echo "---"
  echo ""
  echo "## Components"
  echo ""
  generate_components

  echo ""
  echo "---"
  echo ""
  echo "## Hooks & Lib"
  echo ""
  generate_hooks_lib

  echo ""
  echo "---"
  echo ""
  echo "## Data Model"
  echo ""
  generate_prisma

  echo ""
  echo "---"
  echo ""
  echo "## Environment Variables"
  echo ""
  generate_env

  # Append manual sections
  if [ -n "$manual" ]; then
    echo ""
    echo "$manual"
  else
    cat <<'DEFAULT_MANUAL'

---

## Key Invariants

1. All `/api/*` routes require Clerk auth (enforced in `proxy.ts`).
2. `components/ui/*` and `lib/generated/*` — never modify.
3. Dark-only theme — use CSS tokens from `globals.css`, no hardcoded colors.
4. All components are `"use client"` — no RSC usage yet in app components.
5. State is local React state only — no Redux/Zustand/Jotai.
6. Images are Vercel Blob private store with signed URLs.

---

## How To Update This File

When files/folders change, update the corresponding section:

- **New file/folder added** → Add row to tree or table with one-line purpose.
- **File deleted** → Remove from tree and all tables.
- **File renamed** → Update path in tree and all tables.
- **New route** → Add row to Routes table.
- **New component** → Add row to Components table.
- **New hook/lib** → Add row to Hooks & Lib table.
- **Schema change** → Update Data Model section.
- **New env var** → Add row to Environment Variables.
- **New invariant** → Add to Key Invariants.
- **New dependency** → Update Stack line at top.

Keep descriptions to 1 line. File paths are the primary lookup key.
DEFAULT_MANUAL
  fi

} > "$MAP_FILE"

echo "✅ Updated $MAP_FILE"
