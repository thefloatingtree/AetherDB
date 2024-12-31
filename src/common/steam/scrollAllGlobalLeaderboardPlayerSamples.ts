import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { rivals2SteamLeaderboardUrl } from "./constants/index.js";

type SteamLeaderboardEntry = {
    steamid: string | number;
    score: number;
    rank: number;
    ugcid: string;
    details: string;
};

type SteamLeaderboardResponse = {
    response: {
        nextRequestURL?: string;
        entries: {
            entry: SteamLeaderboardEntry[];
        };
    };
};

type PlayerSample = {
    steamId: string;
    timestamp: Date;
    rank: number;
    elo: number;
};

const parser = new XMLParser();

export async function* scrollAllGlobalLeaderboardPlayerSamples(): AsyncGenerator<PlayerSample> {
    let nextUrl: string | undefined = rivals2SteamLeaderboardUrl;
    do {
        const fetchedAt = new Date();
        const response = await axios.get<string>(nextUrl, {
            responseType: "text"
        });

        const object: SteamLeaderboardResponse = parser.parse(response.data);
        const entryBatch = object.response?.entries?.entry ?? [];
        nextUrl = object.response?.nextRequestURL;

        for (const entry of entryBatch) {
            yield {
                steamId: String(entry.steamid),
                elo: entry.score,
                rank: entry.rank,
                timestamp: fetchedAt,
            };
        }
    } while (nextUrl);
}