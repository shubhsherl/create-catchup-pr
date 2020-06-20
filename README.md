# Create Catchup PR

GitHub Action to sync branchs with one source branch across different forks. First a new branch is created from source then PR is created between new branch and target branch.
New branch is created so that you can fix conflicts if any cause source branch might be protected in some case.
To work properly delete created branches after merging them.

## Inputs

### `GITHUB_TOKEN`

**Required** The token to be used for creating the pull request. Can be set to the one given for the workflow or another user.

### `GITHUB_REPO`

**Required** Github repo with owner name. `${{ github.repository }}`

### `SOURCE_BRANCH`

**Required** The branch you want to make the pull request from.

### `SOURCE_REPO`

**Optional** The repo you want to make the pull request from.

### `TARGET_BRANCH`

**Required** The branchs you want to make the pull request to. Multiple branches need to be separate by comma like in example

### `TITLE`

**Optional** Title for the pull request

### `BODY`

**Optional** Body for the pull request

### `DRAFT`

**Optional** To create a draft pull request (value: "true"/"false", default: "false").

## Outputs

### `PULL_REQUEST_URL`

Set to the URL of either the pull request that was opened by this action or the one that was found to already be open between the two branches.

### `PULL_REQUEST_NUMBER`

Pull request number from generated pull request or the currently open one

### Example

```yml
name: Sync
on:
  push:
    branches:
      - master

jobs:
  sync-branches:
    runs-on: ubuntu-latest
    name: Catching up branches
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Set up Node
        uses: actions/setup-node@v1
        with:
          node-version: 12
      - name: Create Catchup PR
        uses: shubhsherl/create-catchup-pr@v0.0.1
        with:
          GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
          GITHUB_REPO: ${{github.repository}}
          SOURCE_REPO: "octocat"
          SOURCE_BRANCH: "master"
          TARGET_BRANCH: "develop,experiment"
```

Modified version of action [Create Sync PR](https://github.com/sudoStatus200/create-sync-pr) with support of creating pr from different forks.
