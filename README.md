# Run docker containers without fuss

Sick and tired of having to setup *coreOS*, *dokku*, *beanstalk*, whatever?

## Try this

	npm install -g dock

Make sure the `DOCKER_HOST` env variable is set (otherwise we guess you are using the default UNIX socket).

Now, run the container proxy:
	
	» node dude.js                                                                                                                                                 
	DOCKER HOST => 192.168.59.103
	Proxy listening on port 3000
	containers:

So, no containers running on this docker instance (`192.168.59.103`) and the proxy is listening on `localhost:3000`.

Lets start a container in the foreground (this will pull nginx from the docker repo)

	docker run --rm --name nginx -P nginx

The proxy should indicate the container is mapped

	containers: nginx

Let's test it out

	» http nginx.dev:3000                                                                                                                                        	HTTP/1.1 200 OK
	connection: close
    ...
    <p><em>Thank you for using nginx.</em></p>
	</body>
	</html>

Ok that works. Now when you `C^c` the `docker run --rm` command, this stops and removes the container. The proxy output should update again.

Now, trying to access nginx again gives an error:

	~/r/D/dock » http nginx.dev:3000                                                                                                                                           
	HTTP/1.1 404 Not Found
	Connection: keep-alive
	Content-Type: text/plain
	Date: Wed, 26 Nov 2014 03:34:35 GMT
	Transfer-Encoding: chunked
	
	No container with public ports found for hostname 'nginx.dev'	
That's it. Easy no?

## Running containers

### You need a **docker host**

#### On OSX for development using `boot2docker`

See [[Docker]] for details, but **TL;DR**

	brew install boot2docker
	boot2docker upgrade

The following command prints some shell script you should run to set some environment vars.	
	boot2docker shellinit 2> /dev/null

The host should now be reachable, try it

	docker ps


#### Debian production

I guess it's

	apt-get install docker

### Run existing container

This should start nginx

	docker run --rm --name nginx -P nginx

Your host is now accessible at

	http://nginx.dev/

### Build and run custom docker image

**TL;DR** (see [[Docker]] for more info)

	docker build --no-cache --rm -t testlab/something .
	docker images
	docker ps
	docker run --rm --name something -P testlab/something

This is now accessible at

	http://something.dev/

(Or any subdomain that starts with the name of the container)

## Work with `.dev` hostnames mapping to `127.0.0.1`.

Install dnsmasq to cache DNS queries and resolve `*.localhost.com` to `127.0.0.1`

	brew install dnsmasq

Add DNS entry for `localhost.com` to `/usr/local/etc/dnsmasq.conf`

	echo "address=/dev/127.0.0.1" > /usr/local/etc/dnsmasq.conf

Install launchdeamon and load dnsmasq now

	sudo cp -fv /usr/local/opt/dnsmasq/*.plist /Library/LaunchDaemons
	sudo chown root /Library/LaunchDaemons/homebrew.mxcl.dnsmasq.plist
	sudo launchctl load /Library/LaunchDaemons/homebrew.mxcl.dnsmasq.plist

If you made a mistake in the configuration, use the following commands after
changing the conf to restart dnsmasq

	# stop might actually also start it again, anyway
	sudo launchctl stop homebrew.mxcl.dnsmasq
	sudo launchctl start homebrew.mxcl.dnsmasq

Make OSX resolve all `.dev` domains using our local DNS server ([details](http://passingcuriosity.com/2013/dnsmasq-dev-osx/))

	sudo mkdir -p /etc/resolver
	echo nameserver 127.0.0.1 >> /tmp/deans
	sudo mv /tmp/devns /etc/resolver/dev
	
# References/acknowledgements

This library uses

- the [docker remote API](https://docs.docker.com/reference/api/docker_remote_api_v1.15/#list-containers)
- [NodeJS bindings](https://github.com/mafintosh/docker-remote-api) by *mafintosh*
- Tool to get [DOCKER_HOST](https://github.com/mafintosh/docker-host) also by *mafintosh*