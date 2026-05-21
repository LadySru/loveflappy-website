import type { Config, Context } from "@netlify/functions";

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const endpoint = url.searchParams.get("endpoint");

  if (!endpoint) {
    return Response.json({ error: "Missing endpoint parameter" }, { status: 400 });
  }

  const apiKey = Netlify.env.get("YOUTUBE_API_KEY");
  if (!apiKey) {
    return Response.json({ error: "YouTube API key not configured" }, { status: 500 });
  }

  const allowed = ["search", "channels"];
  if (!allowed.includes(endpoint)) {
    return Response.json({ error: "Invalid endpoint" }, { status: 400 });
  }

  const params = new URLSearchParams(url.searchParams);
  params.delete("endpoint");
  params.set("key", apiKey);

  const ytUrl = `https://www.googleapis.com/youtube/v3/${endpoint}?${params.toString()}`;

  const res = await fetch(ytUrl);
  const data = await res.json();

  return Response.json(data, {
    status: res.status,
    headers: { "Cache-Control": "public, max-age=60" },
  });
};

export const config: Config = {
  path: "/api/youtube",
  method: "GET",
};
