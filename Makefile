ifndef u
u:=sudo
endif

ifndef env
env:=dev
endif

OS:=$(shell uname)

deploy:
	git pull
	yarn
	docker-compose exec app php artisan storage:link
	rm public/storage
	yarn build
	docker-compose exec app php artisan storage:link
