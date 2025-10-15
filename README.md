# SmartRecruit Pro

A deployable Next.js app that lets employers upload a job description and unlimited resumes (PDF/DOCX/TXT), then generates a ranked shortlist with evidence in a polished UI.

## Features
- Elegant, professional UI with TailwindCSS
- Upload multiple resumes at once (PDF, DOCX, TXT); server parses and scores
- Keyword & skills-based scoring with evidence badges, education/experience heuristics
- Results in a sortable-like table (basic)
- No hard limit in code; configure upload size at your infrastructure (reverse proxy / server) level

## Getting Started
```bash
npm install
npm run dev
# open http://localhost:3000
```
Build & run production:
```bash
npm run build
npm start
```

> Note on "no limitations": typical hosts impose request size/time limits. Adjust proxy/body limits if you truly need very large files.
