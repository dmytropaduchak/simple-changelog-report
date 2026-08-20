import * as fs from "node:fs";
import * as core from "@actions/core";
import * as github from "@actions/github";
import { entriesFromCommits, formatChangelog } from "./rules";

const MARKER = "<!-- simple-changelog-report -->";
const NAME = "Simple Changelog Report";

async function upsertPrComment(token: string, body: string): Promise<void> {
  const { context } = github;
  if (context.eventName !== "pull_request" && context.eventName !== "pull_request_target") return;
  const issue_number = context.payload.pull_request?.number;
  if (!issue_number) return;
  const octokit = github.getOctokit(token);
  const { data: comments } = await octokit.rest.issues.listComments({ ...context.repo, issue_number });
  const existing = comments.find((c) => c.body?.includes(MARKER));
  if (existing) {
    await octokit.rest.issues.updateComment({ ...context.repo, comment_id: existing.id, body });
    return;
  }
  await octokit.rest.issues.createComment({ ...context.repo, issue_number, body });
}

async function run(): Promise<void> {
  const token = core.getInput("github-token") || process.env.GITHUB_TOKEN || "";
  if (!token) {
    core.setFailed("github-token is required.");
    return;
  }
  const { context } = github;
  const octokit = github.getOctokit(token);
  const pr = context.payload.pull_request;
  let base = core.getInput("base") || "";
  let head = core.getInput("head") || "";
  if (!base && pr) base = pr.base.sha;
  if (!head && pr) head = pr.head.sha;
  if (!head) head = context.sha;
  if (!base) {
    const { data: tags } = await octokit.rest.repos.listTags({ ...context.repo, per_page: 2 });
    base = tags[0]?.commit.sha || `${head}~10`;
  }

  const { data } = await octokit.rest.repos.compareCommits({
    ...context.repo,
    base,
    head,
  });
  const entries = entriesFromCommits(data.commits || []);
  const rangeLabel = `${base.slice(0, 7)}...${head.slice(0, 7)}`;
  const body = formatChangelog(entries, rangeLabel, MARKER, NAME);
  const outPath = core.getInput("output-path") || "";
  if (outPath) {
    fs.writeFileSync(outPath, body.replace(MARKER + "\n", "").replace(`## ${NAME}\n\n`, ""), "utf8");
    core.info(`Wrote ${outPath}`);
  }
  await core.summary.addRaw(body, true).write();
  try {
    await upsertPrComment(token, body);
  } catch (e) {
    core.warning(`Could not post PR comment: ${e instanceof Error ? e.message : String(e)}`);
  }
  core.setOutput("changelog", body);
  core.setOutput("entry-count", String(entries.length));
  core.info(`Changelog: ${entries.length} entries for ${rangeLabel}`);
}

run().catch((e) => core.setFailed(e instanceof Error ? e.message : String(e)));
