# John Loh — Portfolio

Personal portfolio site: <https://7ohnloh.github.io>

Plain HTML, CSS and JavaScript. No build step.

## Structure

```
index.html              homepage (projects, experience, kind words, about, contact)
work/<project>/         one page per case study
css/style.css           all styles (light and dark themes)
js/main.js              section highlighting and copy-email button
images/<project>/       project images
resume.pdf              downloadable résumé
```

## Run locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Deploy

Pushing to `main` publishes the site with GitHub Pages.
