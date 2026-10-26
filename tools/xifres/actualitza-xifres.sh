#!/usr/bin/env bash
# Recalcula les dades de «ESSTrapis en xifres» (assets/js/xifres.js).
#
#   tools/xifres/actualitza-xifres.sh [any_final]
#
# 1. Executa xifres.sql a cada tenant del VPS (tenants.conf; sense demo ni
#    ladili_test) amb les credencials de envs/<tenant>.env. Només llegeix.
# 2. Compta les entrades del registre de canvis (projectes-front/src/service/changelog.js).
# 3. Escriu a la sortida les línies ANYS i DADES per enganxar a xifres.js,
#    i deixa el detall per tenant a tools/xifres/sortida/ (ignorat per git).
set -euo pipefail

VPS=webcoop@89.117.62.105
EXCLOSOS="demo ladili_test"           # demo i còpies de prova
ANY_INICI=2021
ANY_FINAL=${1:-$(date +%Y)}
DIR=$(cd "$(dirname "$0")" && pwd)
FRONT=${FRONT:-$DIR/../../../projectes-front}
OUT=$DIR/sortida
mkdir -p "$OUT"

scp -q "$DIR/xifres.sql" "$VPS:/tmp/esstrapis-xifres.sql"
ssh "$VPS" "EXCLOSOS='$EXCLOSOS' bash -s" > "$OUT/per-tenant.tsv" <<'EOF'
set -e
cd /var/www/esstrapis-back/envs
for t in $(awk '!/^#/ && NF {print $1}' ../tenants.conf); do
  case " $EXCLOSOS " in *" $t "*) continue;; esac
  ( . "./$t.env"; MYSQL_PWD="$DATABASE_PASSWORD" mysql -h127.0.0.1 -u"$DATABASE_USERNAME" "$DATABASE_NAME" -N < /tmp/esstrapis-xifres.sql | sed "s/^/$t\t/" ) || echo "ERROR a $t" >&2
done
rm -f /tmp/esstrapis-xifres.sql
EOF

# Registre de canvis: entrades per any (totes: novetats, millores i correccions)
cp "$FRONT/src/service/changelog.js" "$OUT/changelog.mjs"
node -e '
import(process.argv[1]).then(({ CHANGELOG }) => {
  const r = {}
  for (const e of CHANGELOG) { const y = e.date.slice(0, 4); r[y] = (r[y] || 0) + e.items.length }
  console.log(JSON.stringify(r))
})' "$OUT/changelog.mjs" > "$OUT/changelog.json"

python3 - "$OUT/per-tenant.tsv" "$OUT/changelog.json" "$ANY_INICI" "$ANY_FINAL" <<'EOF'
import sys, json, collections
tsv, cl, a0, a1 = sys.argv[1], json.load(open(sys.argv[2])), int(sys.argv[3]), int(sys.argv[4])
anys = list(range(a0, a1 + 1))
tot = collections.defaultdict(lambda: collections.defaultdict(float))
primer, tenants = {}, set()
for l in open(tsv):
    t, m, y, v = l.rstrip("\n").split("\t")
    tenants.add(t)
    if v == "NULL" or not y.isdigit(): continue
    y, v = int(y), float(v)
    tot[m][y] += v
    # Any d'entrada d'un tenant: primer any (2019+) amb dades de debò (>= 3)
    if m in ("projects", "hours_entries", "emitted_invoices", "received_invoices", "orders") and 2019 <= y <= a1 and v >= 3:
        primer[t] = min(primer.get(t, 9999), y)
for t in tenants: primer.setdefault(t, a1)   # tenants nous, encara sense dades
ent = [sum(1 for y0 in primer.values() if y0 <= y) for y in anys]
fila = lambda m: [int(tot[m][y]) for y in anys]
print("Any d'entrada:", ", ".join(f"{t} {y}" for t, y in sorted(primer.items(), key=lambda x: (x[1], x[0]))))
print("Extres (no surten a la web):", {m: fila(m) for m in ("hours_entries", "invoiced_base", "orders", "tasks")})
print("Contactes:", int(tot["contacts"][0]), "· Usuaris actius:", int(tot["users"][0]))
print("\n// --- per enganxar a assets/js/xifres.js ---")
print(f"var ANYS = {anys};")
print(f"""		{{ titol: "Entitats", text: "que fan servir ESSTrapis", valors: {ent}, total: "ultim" }},
		{{ titol: "Projectes", text: "gestionats", valors: {fila('projects')} }},
		{{ titol: "Hores", text: "dedicades i registrades", valors: {fila('hours')} }},
		{{ titol: "Factures emeses", text: "a clients i finançadors", valors: {fila('emitted_invoices')} }},
		{{ titol: "Factures rebudes", text: "de proveïdors", valors: {fila('received_invoices')} }},
		{{ titol: "Canvis a l'aplicació", text: "novetats, millores i correccions", valors: {[cl.get(str(y), 0) for y in anys]} }}"""))
EOF
