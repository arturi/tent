# Tent

<img width="70" src="logo.png" align="left">

Experimental admin interface to static sites / notes / whatever. Editor for Markdown body with YAML frontmatter fields and a cool live preview. Plus drag and drop image/file upload with resizing and optimization built it :sparkles: Built with Hyperapp and/or Preact. WIP.

![tent admin interface: YAML frontmatter and body](screenshot-2.jpg)

## Features

* Runs locally or on the server
* Supports options for document and file storage directories, like so: `node node_modules/tent/server/index.js --docs=content --public=public --relativeMediaDir=/media/`
* Smart attachement handling: resizes and optimizes images, stores everything else. Inserts a relative link into the document body (where the cursor is), after you drag & drop the file.

## Usage

```sh
npm install
npm start
```
