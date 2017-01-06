"build": "browserify -t csjs-injectify -t yo-yoify -t babelify index.js -o dist/tent.js",
"build:umd": "browserify -s Tent -t csjs-injectify -t yo-yoify -t babelify -t uglifyify index.js -o tent.min.js",
