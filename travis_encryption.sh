#!/bin/bash
set -eu
rm -f secrets.tar secrets.tar.enc &&
tar cvf secrets.tar config.yml functions/authorizer/pubkey.pem &&
travis encrypt-file secrets.tar
