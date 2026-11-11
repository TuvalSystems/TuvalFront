#!/usr/bin/env bash
set -euo pipefail
umask 0022

target=/var/www/TuvalFront
source_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd -P)
sha=${GITHUB_SHA:?Falta GITHUB_SHA}

[[ $(hostname -s) == srv-web02 ]] || { echo 'Destino incorrecto.' >&2; exit 1; }
[[ ${GITHUB_REPOSITORY:-} == TuvalSystems/TuvalFront ]]
[[ ${GITHUB_REF:-} == refs/heads/develop ]]
[[ $sha =~ ^[0-9a-f]{40}$ ]]
[[ $(git -C "$source_dir" rev-parse HEAD) == "$sha" ]]
[[ $source_dir != "$target" && -d $target/.git ]]
[[ -s $source_dir/vue/index.html && -s $source_dir/vue/version.json ]]

exec 9>/var/lib/tuval-runner/deploy.lock
flock -w 900 9

# Preparar cada compilación fuera de la ruta que Apache está sirviendo.
release="$target/.releases/${sha}-${GITHUB_RUN_ID:?}-${GITHUB_RUN_ATTEMPT:?}"
[[ ! -e $release ]]
mkdir -p "$release"
cp -a "$source_dir/vue/." "$release/"
chmod -R a+rX "$release"
python3 - "$release/version.json" "$sha" <<'PY'
import json, sys
with open(sys.argv[1], encoding="utf-8") as file:
    version = json.load(file)
if not sys.argv[2].startswith(version["gitCommitHash"]):
    raise SystemExit("La compilación no corresponde al commit solicitado.")
PY

previous=
if [[ -L $target/vue ]]; then
    previous=$(readlink "$target/vue")
elif [[ -d $target/vue ]]; then
    # Conservar la compilación original para recuperación.
    previous="$target/.releases/before-actions-$(date +%Y%m%d%H%M%S)"
    mv "$target/vue" "$previous"
elif [[ -e $target/vue ]]; then
    echo 'La ruta vue no es un directorio ni un enlace.' >&2
    exit 1
fi

link="$target/.vue-${GITHUB_RUN_ID}-${GITHUB_RUN_ATTEMPT}"
ln -s "$release" "$link"
mv -Tf "$link" "$target/vue"

if ! curl --fail --silent --show-error --max-time 20 \
    --header 'Host: tuvalweb.cosenco.ec' http://127.0.0.1/version.json \
    | python3 -c 'import json,sys; d=json.load(sys.stdin); sys.exit(0 if sys.argv[1].startswith(d["gitCommitHash"]) else 1)' "$sha"; then
    if [[ -n $previous ]]; then
        ln -s "$previous" "$link"
        mv -Tf "$link" "$target/vue"
        echo 'Falló la comprobación HTTP; se restauró la compilación anterior.' >&2
    fi
    exit 1
fi
echo "Frontend desplegado: $sha"
