project=alemayhu/notion2anki

# -- build / push -- #
docker:
	earth +docker

push:
	earth --push +docker

# -- testing / debug -- #
server:
	docker run -p 8080:8080 -i ${project}

debug:
	## huh? Why though?
	docker run -t -i ${project} /bin/bash