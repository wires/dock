var argv = require('minimist')(process.argv.slice(2));
var pp = require('prettyjson');

// URL parsing
var url = require("url");

// HTTP proxying
var http = require('http');
var httpProxy = require('http-proxy');

// set the docker host from DOCKER_HOST env variable
var DOCKER_HOST = require('docker-host')();
var host = DOCKER_HOST.host || 'localhost';
console.log('DOCKER HOST =>\n\t' + pp.render(DOCKER_HOST).replace('\n','\n\t') + '\n');

// current known containers
var state = {
	vhosts: {}
}

var containers = require('./containers');
var repeat = require('./utils').repeat;
var deepEqual = require('deep-equal')

function update() {
	return containers()
		.then(function(mappings){
			if(deepEqual(state.vhosts, mappings))
				return;

			// update state, tell the world
			console.log('containers: ' + Object.keys(mappings).join(';'));
			state.vhosts = mappings;
		})
		.fail(function(err){
			console.log('failed to update container mappings', err)
		});
}
repeat(update, 2000)

// in the mean time, let start proxying http request
var pport = argv.port || 3000;

var proxy = httpProxy.createProxyServer({});

var server = http.createServer(function(req, res) {

	// get some request details
	var hostname = req.headers.host.split(":")[0];
	var subdom = hostname.split('.')[0];
	var ports = state.vhosts[subdom];
	console.log('REQ =>', hostname, subdom, host, ports);

	if(!ports)
	{
		// 404 on that nigga
		res.writeHead(404, {"Content-Type": "text/plain"});
		res.write("No container with public ports found for hostname '" + hostname +"'");
		res.end();
	}
	else
	{
		// TODO better port selection
		var port = (ports.length && ports[0]);

		proxy.web(req, res, { target: 'http://' + host + ':' + port });

		// TODO proxy websockets using proxy.ws()
	}
});

server.listen(pport);

console.log("Proxy listening on port", pport);

