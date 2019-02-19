// Include http ,url module.
var http = require('http');
var url = require('url');

// Load the application classes
//const UserStory = require('../../../contract/lib/story.js');
const Client = require('../application/client.js');

// Create http server.
var httpServer = http.createServer(function (req, resp) {

    console.log(`Request from ${req.socket.remoteAddress}`);

    // Get request method.
    var method = req.method;

    // If post.
    if ("POST" == method) {
        var postData = '';

        // Get all post data when receive data event.
        req.on('data', function (chunk) {
            postData += chunk;
        });

        // When all request post data has been received.
        req.on('end', async function () {

            //console.log("Client post data : " + postData);
            let payload = JSON.parse(postData);

            let action = payload['action'];
            let issue = payload['issue'];
            let number = issue['number'];
            
            // Create a client to communicate with the Hyperledger network
            const client = new Client('../gateway/networkConnection.yaml', '../identity/user/isabella/wallet');
            
            try {
                // Connect to the network
                await client.connect();
                
                console.log(`Action = ${action}`);
                if (action === 'milestoned') {
                    let sprint = issue['milestone']['title'];
                    let title = issue['title'];

                    console.log(`Assigning Issue ${number} to [${title}] to sprint [${sprint}]`);
                    await client.assign('Issue', number.toString(), title, sprint);
                } else if (action === 'assigned') {
                    //let owner = issue['assignee']['login'];
                    console.log(`Ignoring ${action} action`);
                } else if (action === 'labeled') {
                    let labels = issue['labels'];
                    if (labels.length < 1) {
                        console.log(`ERROR: Expected at least 1 label`);
                    } else {
                        let developer = '';
                        let designer = '';
                        let sprint = issue['milestone']['title'];

                        for (let i in labels) {  
                            let label = labels[i];
                            if (label['name'].includes('Designer')) {
                                designer = label['name'].substring(0, label['name'].length - 11);
                                await client.design('Issue', number.toString(), sprint, designer);
                            } else if (label['name'].includes('Developer')) {
                                developer = label['name'].substring(0, label['name'].length - 12);
                                await client.develop('Issue', number.toString(), designer, developer);
                            } else {
                                console.log(`ERROR: No support for ${label['name']} label`);
                            }
                        }

                        if (developer != '') {
                            console.log(`Marking Issue ${number} as in developing state with owner [${developer}] from designer [${designer}]`);
                        } else if (designer != '') {
                            let sprint = issue['milestone']['title'];
                            console.log(`Marking Issue ${number} as in designing state with owner [${designer}] in sprint [${sprint}]`);
                        } else {
                            console.log(`ERROR: no actionble labels found`);
                        }
                    }
                } else {
                    console.log(`ERROR: No support for ${action} action`);
                }

                resp.writeHead(200, { 'Access-Control-Allow-Origin': '*' });
                resp.end();
            } catch (error) {
                console.log(`Error processing ${action} transaction. ${error}`);
                console.log(error.stack);
                resp.writeHead(500, { 'Access-Control-Allow-Origin': '*' });
                resp.end(error.stack);
            } finally {
                client.disconnect();
            }
        })
    } else if ("GET" == method) {
        resp.writeHead(200, {'Access-Control-Allow-Origin':'*'});
        resp.end("Expected POST of GitHub Data");
    }
});

// Http server listen on port 8888.
httpServer.listen(8888);

console.log("Server is started.");