#!bash

BUCKET=sps-by-the-numbers-public

gsutil acl ch -u AllUsers:R gs://${BUCKET}

gsutil iam ch allUsers:objectViewer gs://${BUCKET}
gsutil acl set public-read gs://${BUCKET}
gsutil defacl set public-read gs://${BUCKET}


# Lifecycle deletes are scoped to cache/scratch/ (1 day) and cache/prod/
# (30 days). static/ (the bigsheet_inputs external-table CSVs published by
# data-tools scripts/publish_bigsheet_inputs.sh) MUST stay outside every
# matchesPrefix, and matchesPrefix must be a JSON array: a bare string is
# silently dropped and the rule then deletes the whole bucket daily.
gsutil lifecycle set sps-by-the-numbers-cache.json gs://${BUCKET}
gsutil cors set sps-by-the-numbers-cache-cors.json gs://${BUCKET}

