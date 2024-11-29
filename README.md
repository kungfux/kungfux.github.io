# Blog
Check it out at [kungfux.github.io](https://kungfux.github.io)

## Development
### Commands
- Restore
```bash
$ bundle
```

- Build
```bash
$ bundle exec jekyll
```

- Include drafts into build
```bash
$ bundle exec jekyll --drafts
```

- Build and watch
```bash
$ bundle exec jekyll s
```

- Build like in production
```bash
$ JEKYLL_ENV=production bundle exec jekyll s
```

### Upgrade
1. Update version number
```diff
- gem "jekyll-theme-chirpy", "= 6.5.4"
+ gem "jekyll-theme-chirpy", "= 6.5.5"
```

2. Run `bundle`

### Assets
- Image format is `.webp`
- Cover image size `1200 x 630` with aspect ratio of `1.91 : 1`

- Copy assets to container
```bash
$ docker cp cover.webp kungfux.github.io:/workspaces/kungfux.github.io/assets/media/2024
```

### Customizations

- Adjust styles for schemas and code blocks
  `assets/css/jekyll-theme-chirpy.scss`
- Single line post titles
  `assets/css/jekyll-theme-chirpy.scss`
- GitHub alerts
  `assets/css/github-alerts.css`
- Add progress bar to back to top
  `assets/js/progress.js`, `assets/css/jekyll-theme-chirpy.scss`, `_includes/metadata-hook.html`
- Trigger PWA update automatically
  `assets/js/auto-update.js`, `_includes/metadata-hook.html`
- Fix pageviews
  `_includes/pageviews/goatcounter.html`
