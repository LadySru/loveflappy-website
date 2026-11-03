import type { Config, Context } from "@netlify/functions";

// Steam Web API proxy
// Env vars needed in Netlify dashboard:
//   STEAM_API_KEY  — free key from https://steamcommunity.com/dev/apikey
//   STEAM_ID       — your 64-bit Steam ID (find yours at https://steamid.io)

export default async (req: Request, context: Context) => {
  const apiKey = Netlify.env.get("STEAM_API_KEY");
  const steamId = Netlify.env.get("STEAM_ID");

  if (!apiKey || !steamId) {
    return Response.json({ error: "STEAM_API_KEY or STEAM_ID not configured" }, { status: 500 });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "recent";

  let steamUrl: string;

  if (action === "recent") {
    steamUrl = `https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/?key=${apiKey}&steamid=${steamId}&format=json&count=8`;
  } else if (action === "profile") {
    steamUrl = `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${apiKey}&steamids=${steamId}&format=json`;
  } else if (action === "owned") {
    steamUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamId}&include_appinfo=true&include_played_free_games=true&format=json`;
  } else {
    return Response.json({ error: "Invalid action" }, { status: 400 });
  }

  const res = await fetch(steamUrl);
  const data = await res.json();

  return Response.json(data, {
    status: res.status,
    headers: { "Cache-Control": "public, max-age=300" },
  });
};

export const config: Config = {
  path: "/api/steam",
  method: "GET",
};
