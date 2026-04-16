/** Convert a slug like "andrew_huberman" to "Andrew Huberman" */
export function formatChannelName(slug: string): string {
  if (!slug || slug === "unknown" || slug === "_all") return slug;
  return slug
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
