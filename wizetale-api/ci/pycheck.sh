set -e
python -m compileall -q app || {
  echo '❌  Python syntax error, abort build'; exit 1; }
