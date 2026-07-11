import { listPublishedEncouragements } from "@/server/encouragements";

const BASE =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.acts2028sheepdogsociety.com";

// Regenerate the feed hourly (published letters change weekly at most).
export const revalidate = 3600;

function escapeXml(input: string): string {
  return input.replace(
    /[<>&'"]/g,
    (c) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        "'": "&apos;",
        '"': "&quot;",
      })[c] as string
  );
}

export async function GET() {
  let items = "";
  try {
    const letters = await listPublishedEncouragements();
    items = letters
      .map((l) => {
        const url = `${BASE}/letter/${l.slug}`;
        const pubDate = (
          l.publishDate ? new Date(l.publishDate) : new Date()
        ).toUTCString();
        return `    <item>
      <title>${escapeXml(l.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(l.intro ?? "")}</description>
    </item>`;
      })
      .join("\n");
  } catch {
    // DB unavailable — serve a valid, empty channel rather than 500.
    items = "";
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>The Letter — Sheepdog Society</title>
    <link>${BASE}/letter</link>
    <description>One letter a week. A scripture. A practice. Anchored in Acts 20:28.</description>
    <language>en-us</language>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control":
        "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
