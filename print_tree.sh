#!/usr/bin/env bash
# usage: ./print_tree.sh  > project_dump.txt

find . \
  -type f \
  ! -path '*/node_modules/*' \
  ! -name 'package-lock.json' \
  ! -name 'yarn.lock' \
  ! -name 'pnpm-lock.yaml' \
  ! -name '*lock*.json' \
  ! -name 'project_dump.txt' \
  ! -name '*lock*.yaml' \
  ! -path '*/dist/*' \
  ! -path '*/logs/*' \
  ! -path '*/.git/*' \
  -print0 |
  sort -z |
  while IFS= read -r -d '' file; do
    rel="${file#./}"
    echo "// ========================="
    echo "// 📄 ${rel}"
    echo "// ========================="
    cat "$file"
    echo                    # пустая строка-разделитель
  done
