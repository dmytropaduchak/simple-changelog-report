# simple-changelog-report

Generates changelog markdown for a tag/SHA range from commits. Does not check whether a CHANGELOG file exists.

## Usage

```yaml
name: Changelog report
on:
  pull_request:
  release:
    types: [published]

permissions:
  contents: read
  pull-requests: write

jobs:
  simple-changelog-report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dmytropaduchak/simple-changelog-report@v0.1.1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          output-path: CHANGELOG.generated.md
```

## Inputs

| Input | Default | Description |
| --- | --- | --- |
| `github-token` | `${{ github.token }}` | Token to list commits and post comments |
| `base` | _(auto)_ | Base ref/SHA/tag |
| `head` | _(auto)_ | Head ref/SHA |
| `output-path` | _(none)_ | Optional file to write |

## Develop

```bash
npm install && npm run build
```
