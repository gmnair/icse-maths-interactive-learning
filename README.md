# ICSE Maths Interactive Learning

A free, browser-based revision hub for the ICSE Class 10 Mathematics syllabus. It combines concise lesson notes with worked examples and small interactive tools for practice.

## Run locally

Open `src/index.html` in a browser, or serve the repository root with any static file server. No build step or package installation is required.

## GitHub Pages

GitHub Pages is configured to build with **GitHub Actions**. The workflow in `.github/workflows/pages.yml` publishes the contents of `src/` as the site root when changes are pushed to `main`, and can also be started manually from the Actions tab. The site uses relative asset paths and works at the repository's GitHub Pages subpath.

## Topics

See [`docs/syllabus.md`](docs/syllabus.md) for the topic map and coverage notes. The page uses MathJax for notation, JSXGraph for the heights-and-distances diagram, and Chart.js for statistics and probability charts. The lesson text and standard HTML calculators remain available if a CDN library cannot load.
