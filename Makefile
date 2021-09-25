project=alemayhu/notion2anki

docker:
	docker build -t ${project} .
docker_deploy: docker docker_push
	echo "Pushed to docker"
docker_run: docker
	docker run -t -i ${project} /bin/bash
server: docker
	docker run -p 8080:8080 -i ${project}
docker_push:
	docker push ${project}
ssr:
	git add server && \
	git commit -m 'server: $(shell git --no-pager log -1 --pretty='tformat:%h (%s, %ad)' --date=short)'