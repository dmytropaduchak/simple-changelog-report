export type ChangelogEntry = {
  sha: string;
  title: string;
  author: string;
};

export function entriesFromCommits(
  commits: Array<{ sha: string; commit: { message: string; author?: { name?: string } | null } }>,
): ChangelogEntry[] {
  return commits.map((c) => {
    const title = (c.commit.message || "").split(/\r?\n/)[0].trim() || c.sha.slice(0, 7);
    return {
      sha: c.sha.slice(0, 7),
      title,
      author: c.commit.author?.name || "unknown",
    };
  });
}

export function formatChangelog(
  entries: ChangelogEntry[],
  rangeLabel: string,
  marker: string,
  name: string,
): string {
  const rows = entries.map((e) => `- ${e.title} (\`${e.sha}\`) — ${e.author}`).join("\n");
  return [
    marker,
    `## ${name}`,
    "",
    `### ${rangeLabel}`,
    "",
    rows || "_No commits in range._",
  ].join("\n");
}
