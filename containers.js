var Q = require('kew')

// Docker Remote API client 
var DockerClient = require('docker-remote-api');

// connect to docker and retrieve containers
var docker = new DockerClient();

// return a dictionary mapping short container names to public ports
function containersToVHosts(containers) {
	return containers.reduce(function(d, container){
		// map all container names into the dictionary `d`
		container.Names.forEach(function(name){
			// "foo/bar" => {bar: container.Ports}
			d[name.replace(/.*?\//,'')] = container.Ports.filter(function(port){
				// remove all private only ports
				return port.PublicPort && (port.Type === 'tcp')
			}).map(function(port){
				return port.PublicPort;
			});
		});
		return d;
	}, {});
}

module.exports = function() {
	var deferred = Q.defer();

	// TODO git push based? serf support?
	docker.get('/containers/json', {json:true}, function(err, containers){
		/*
		 * Reponse looks like
		 *
		 * [
		 *	{
		 *		Command: 'nginx -g \'daemon off;\'',
		 *		Created: 1416962198,
		 *		Id: '7ab76d2725ed841799a5dc9c335c494e48351531d57dde555b5b293415bb8e24',
		 *		Image: 'nginx:latest',
		 *		Names: [ '/nginx-test' ],
		 *		Ports: [
		 *			{ IP: '0.0.0.0', PrivatePort: 80, PublicPort: 80, Type: 'tcp' },
		 *			{ PrivatePort: 443, Type: 'tcp' }
		 *		],
		 *		Status: 'Up About a minute'
		 *	}
		 * ]
		 *
		 */

		if (err)
			deferred.reject(err)
		else
			// update the mappings hostname => container ports
			deferred.resolve(containersToVHosts(containers));
	});

	return deferred.promise;
}
