#!/bin/sh

VERSION=$1

if [ -z "$VERSION" ]; then
    echo "Version must be spcified"
    exit 1
fi

docker exec cliDevCorp peer chaincode install -n userstory -v $VERSION -p /opt/gopath/src/github.com/contract -l node
docker exec cliDevCorp peer chaincode upgrade -n userstory -v $VERSION -l node -c '{"Args":["com.embotics.devweek.userstory:instantiate"]}' -C mychannel -P "AND ('Org1MSP.member')"