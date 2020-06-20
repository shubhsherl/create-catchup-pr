const core = require("@actions/core");
const github = require("@actions/github");
const createBranch = require("./create-branch");

async function run() {
  try {
    const sourceBranch = core.getInput("SOURCE_BRANCH", { required: true });
    const githubRepo = core.getInput("GITHUB_REPO", { required: true });
    let sourceRepo = core.getInput("SOURCE_REPO", { required: false });
    const targetBranches = core.getInput("TARGET_BRANCH", { required: true });
    const githubToken = core.getInput("GITHUB_TOKEN", { required: true });
    const title = core.getInput("TITLE", { required: false });
    const body = core.getInput("BODY", { required: false });
    const draft = core.getInput("DRAFT", { required: false });

    const targetBranchesArray = targetBranches.split(",");
    const repo = { repo: githubRepo.split("/")[1], owner: githubRepo.split("/")[0] };

    const octokit = new github.GitHub(githubToken);

    const { data: currentPulls } = await octokit.pulls.list(repo);

    if (!sourceRepo) {
      sourceRepo = repo.owner;
    }

    const { data: { commit: { sha } } } = await octokit.repos.getBranch({
      ...repo,
      branch: sourceBranch,
    })

    for (let branch of targetBranchesArray) {

      console.log(`Making a pull request for ${branch} from ${sourceRepo}:${sourceBranch}.`);
      
      const newBranch = `${branch}-catchup-${sha}`;
      await createBranch(octokit, repo, sha, newBranch);

      const currentPull = currentPulls.find((pull) => {
        return pull.head.ref === newBranch && pull.base.ref === branch;
      });

      if (!currentPull) {
        const { data: pullRequest } = await octokit.pulls.create({
          ...repo,
          head: newBranch,
          base: branch,
          title: title || `[Catchup]: Merge ${sourceRepo}:${sourceBranch} to ${branch}`,
          body: body || `Catchup PR to merge ${sourceRepo}:${sourceBranch} in ${branch} with ${newBranch}`,
          draft: draft === "true",
        });

        console.log(
          `Pull request (${pullRequest.number}) successful! You can view it here: ${pullRequest.url}.`
        );

        core.setOutput("PULL_REQUEST_URL", pullRequest.url.toString());
        core.setOutput("PULL_REQUEST_NUMBER", pullRequest.number.toString());
      } else {
        console.log(
          `There is already a pull request (${currentPull.number}) to ${branch} from ${newBranch}.`,
          `You can view it here: ${currentPull.url}`
        );

        core.setOutput("PULL_REQUEST_URL", currentPull.url.toString());
        core.setOutput("PULL_REQUEST_NUMBER", currentPull.number.toString());
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
