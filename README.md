# simple-changelog-report

Generates changelog markdown for a tag/SHA range from commits. Does not check whether a CHANGELOG file exists.

## Usage

```yaml
- uses: actions/checkout@v4
- uses: dmytropaduchak/simple-changelog-report@v0.1.0
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    base: v0.1.0
    head: HEAD
    output-path: CHANGELOG.generated.md
```

## Develop

```bash
npm install && npm run build
```
