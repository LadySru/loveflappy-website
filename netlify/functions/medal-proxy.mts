import type { Config, Context } from "@netlify/functions";

// Medal.tv API proxy
// Env vars needed in Netlify dashboard:
//   MEDAL_API_KEY  — free key from https://medal.tv/developer
//   MEDAL_USER_ID  — your numeric user ID (find it via: https://developers.medal.tv/v1/search/users?q=kiyodreams with your API key)

export default async (req: Request, context: Context) => {
  const apiKey = Netlify.env.get("MEDAL_API_KEY");
  const userId = Netlify.env.get("MEDAL_USER_ID");

  if (!apiKey) {
    return Response.json({ error: "MEDAL_API_KEY not configured" }, { status: 500 });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "clips";

  let medalUrl: string;

  if (action === "clips") {
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "12"), 24);
    const params = new URLSearchParams({ limit: String(limit), cacheId: String(Date.now()) });
    if (userId) params.set("userId", userId);
    medalUrl = `https://developers.medal.tv/v1/latest?${params}`;
  } else if (action === "search_user") {
    const q = url.searchParams.get("q") || "kiyodreams";
    medalUrl = `https://developers.medal.tv/v1/search/users?q=${encodeURIComponent(q)}&limit=5`;
  } else {
    return Response.json({ error: "Invalid action" }, { status: 400 });
  }

  const res = await fetch(medalUrl, {
    headers: { Authorization: `Public ${apiKey}` },
  });

  const data = await res.json();

  return Response.json(data, {
    status: res.status,
    headers: { "Cache-Control": "public, max-age=120" },
  });
};

export const config: Config = {
  path: "/api/medal",
  method: "GET",
};
