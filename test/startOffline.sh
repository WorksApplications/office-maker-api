#!/usr/bin/env bash
TMPFILE=/var/tmp/offline$$.log

if [ -f .offline.pid ]; then
  echo "Found file .offline.pid. Not starting."
  exit 1
fi

serverless offline start -s test --noAuth &> $TMPFILE &
PID=$!
echo $PID > .offline.pid

# CodeBuild cannot catch this grep?
while ! grep "Offline listening" $TMPFILE
do sleep 1; done

rm $TMPFILE
