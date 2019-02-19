# Developer Week 2019 Demo

## Helpful commands

### Start Basic network
```
$ cd basic-network
$ ./start.sh
```

### Start DevCorp CLI Monitor
```
(DevCorp admin)$ cd change-pipeline/organization/DevCorp/configuration/cli/
(DevCorp admin)$ ./monitordocker.sh net_basic
```

### Start DevCorp Admin CLI
```
(DevCorp admin)$ cd change-pipeline/organization/DevCorp/configuration/cli/
(DevCorp admin)$ docker-compose -f docker-compose.yml up -d cliDevCorp
```

### Install & Instanceiate Contract (Chaincode)
```
docker exec cliDevCorp peer chaincode install -n userstory -v 0 -p /opt/gopath/src/github.com/contract -l node
docker exec cliDevCorp peer chaincode instantiate -n userstory -v 0 -l node -c '{"Args":["com.embotics.devweek.userstory:instantiate"]}' -C mychannel -P "AND ('Org1MSP.member')"
```

### Upgrade Chaincode
```
docker exec cliDevCorp peer chaincode install -n userstory -v 1 -p /opt/gopath/src/github.com/contract -l node
docker exec cliDevCorp peer chaincode upgrade -n userstory -v 1 -l node -c '{"Args":["com.embotics.devweek.userstory:instantiate"]}' -C mychannel -P "AND ('Org1MSP.member')"
```
### Run App
```
(DevCorp user)$ cd change-pipeline/organization/devcorp/application
(DevCorp user)$ node assign-story.js
```