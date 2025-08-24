#!bash

BUCKET=sps-by-the-numbers-public

gsutil acl ch -u AllUsers:R gs://${BUCKET}

gsutil iam ch allUsers:objectViewer gs://${BUCKET}
gsutil acl set public-read gs://${BUCKET}
gsutil defacl set public-read gs://${BUCKET}


gsutil lifecycle set sps-by-the-numbers-cache.json gs://${BUCKET}
gsutil cors set sps-by-the-numbers-cache-cors.json gs://${BUCKET}

