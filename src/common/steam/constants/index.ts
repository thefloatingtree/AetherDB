export const rivals2SteamAppId = "2217000";
export const rivals2LeaderboardId = "14800950";
export const rivals2SteamLeaderboardUrl = `https://steamcommunity.com/stats/${rivals2SteamAppId}/leaderboards/${rivals2LeaderboardId}/?xml=1`;

export function buildSteamProfileUrl(steamId: string) {
    return `https://steamcommunity.com/profiles/${steamId}/?xml=1`;
}