PM2_HOME=.pm2


install: install.front install.back

install.front:
	npm install

install.back:
	[ -d venv ] || python -m venv venv
	./venv/bin/pip install -r api/requirements.txt

up.api:
	./venv/bin/python -m uvicorn api.main:app --reload

up:
	PM2_HOME=${PM2_HOME} npx pm2 start ecosystem.config.cjs


down:
	PM2_HOME=${PM2_HOME} npx pm2 stop all

restart:
	PM2_HOME=${PM2_HOME} npx pm2 restart all

logs.front:
	PM2_HOME=${PM2_HOME} npx pm2 logs front

logs.api:
	PM2_HOME=${PM2_HOME} npx pm2 logs api