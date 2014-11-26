# Run docker containers without fuss

Sick and tired of having to setup *coreOS*, *dokku*, *beanstalk*, whatever.

Try this

	apt-get install docker
	npm install -g dock

## Setup a dockerhost

### For OSX development

	brew install boot2docker
	boot2docker init
	boot2docker up

The following command prints some shell script you should run to set some environment vars.	
	boot2docker shellinit

The host should now be reachable, try it

	docker ps

## Run proxy

Run it,
	
	» node dude.js                                                                                                                                                  
	DOCKER HOST => 192.168.59.103
	Proxy listening on port 3000
	containers:

Lets start a container (this will pull nginx from the docker repo)

	docker run --rm --name nginx -P nginx

The proxy should indicate the container is mapped

	containers: nginx

## Try it

	» http nginx-test.dev:3000                                                                                                                                        	HTTP/1.1 200 OK
	connection: close
    ...
    <p><em>Thank you for using nginx.</em></p>
	</body>
	</html>

Ok that works. Now when you `C^c` the `docker run` command, this stops and removes the container (because of the `--rm` option). The proxy output should update again.

Trying again gives an error:

	~/r/D/dock » http nginx.dev:3000                                                                                                                                           
	HTTP/1.1 404 Not Found
	Connection: keep-alive
	Content-Type: text/plain
	Date: Wed, 26 Nov 2014 03:34:35 GMT
	Transfer-Encoding: chunked
	
	No container with public ports found for hostname 'nginx.dev'


## Build custom docker image

	docker build --no-cache --rm -t testlab/something .
	docker images
	docker ps
	docker run --rm --name nginx -P testlab/something


### Working locally

Install dnsmasq to cache DNS queries and resolve `*.localhost.com` to `127.0.0.1`

	brew install dnsmasq

Add DNS entry for `localhost.com` to `/usr/local/etc/dnsmasq.conf`

	echo "address=/dev/127.0.0.1" > /usr/local/etc/dnsmasq.conf

Install launchdeamon and load dnsmasq now

	sudo cp -fv /usr/local/opt/dnsmasq/*.plist /Library/LaunchDaemons
	sudo chown root /Library/LaunchDaemons/homebrew.mxcl.dnsmasq.plist
	sudo launchctl load /Library/LaunchDaemons/homebrew.mxcl.dnsmasq.plist

If you made a mistake in the configure, use the following commands after
changing the conf to restart dnsmasq

	sudo launchctl stop homebrew.mxcl.dnsmasq
	sudo launchctl start homebrew.mxcl.dnsmasq

From http://passingcuriosity.com/2013/dnsmasq-dev-osx/ ; make OSX
resolve all `.dev` domains

	sudo mkdir -p /etc/resolver
	echo nameserver 127.0.0.1 >> /tmp/devns
	sudo mv /tmp/devns /etc/resolver/dev

