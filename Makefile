install:
	npm install
	python -m venv venv
	. venv/bin/activate
	pip install -r api/requirements.txt


up:
	python -m uvicorn api.main:app --reload