#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input

# Remarque : Les migrations sont exécutées au démarrage du conteneur (runtime)
# dans le startCommand de Render pour bénéficier du montage du disque persistant.
