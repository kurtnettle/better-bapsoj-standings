.ONESHELL:
run:
	@source venv/pyenv/bin/activate;
	@python -m http.server

.ONESHELL:
minify:
	@source venv/nenv/bin/activate
	@echo "[*] Bundling and minifying static resources."
	@npx cleancss -o static/dist/style.min.css static/style.css
	@npx uglifyjs static/*.js --compress > static/dist/bundle.min.js;
	@echo "[*] Done <(￣︶￣)>"


.ONESHELL:
setup:
	@echo -e "Preparing dev env for you. Hold on (￣～￣;)"
	@echo -e "-------------------------------------------"
	@echo "[*] Creating virtual env for python";
	@python -m venv venv/pyenv;
	@source venv/pyenv/bin/activate;
	@echo "[*] Installing nodeenv";
	@pip install --quiet nodeenv;
	@echo "[*] Creating virtual env for node.js";
	@nodeenv --quiet --clean-src --node=20.8.0 --npm=10.1.0 venv/nenv;
	@source venv/nenv/bin/activate;
	@echo "[*] Installing required npm modules.";
	@npm i -D --silent uglify-js clean-css-cli standardx;
	@echo "[*] Enjoy developing <(￣︶￣)>";

clean:
	@echo "[*] removing dir: static/dist"
	@rm -rfd "static/dist"
