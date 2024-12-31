console.log("Hello World!")

// import axios from "axios";
// import { XMLParser } from "fast-xml-parser";
// import "dotenv/config";
// import { db } from "./common/db/index.js";
// import { sql } from "kysely";

// const rivals2SteamAppId = "2217000";
// const rivals2LeaderboardId = "14800950";
// const rivals2SteamLeaderboardUrl = `https://steamcommunity.com/stats/${rivals2SteamAppId}/leaderboards/${rivals2LeaderboardId}/?xml=1`;

// function buildSteamProfileUrl(steamId: string) {
//     return `https://steamcommunity.com/profiles/${steamId}/?xml=1`;
// }

// const parser = new XMLParser();

// type SteamLeaderboardResponse = {
//     response: {
//         nextRequestURL?: string;
//         entries: {
//             entry: SteamLeaderboardEntry[];
//         };
//     };
// };

// type SteamLeaderboardEntry = {
//     steamid: string | number;
//     score: number;
//     rank: number;
//     ugcid: string;
//     details: string;
// };

// type PlayerSample = {
//     steamId: string;
//     timestamp: Date;
//     rank: number;
//     elo: number;
// };

// async function* scrollAllGlobalLeaderboardPlayerSamples(): AsyncGenerator<PlayerSample> {
//     let nextUrl: string | undefined = rivals2SteamLeaderboardUrl;
//     do {
//         const fetchedAt = new Date();
//         const response = await axios.get<string>(nextUrl, {
//             responseType: "text"
//         });

//         const object: SteamLeaderboardResponse = parser.parse(response.data);
//         const entryBatch = object.response?.entries?.entry ?? [];
//         nextUrl = object.response?.nextRequestURL;

//         for (const entry of entryBatch) {
//             yield {
//                 steamId: String(entry.steamid),
//                 elo: entry.score,
//                 rank: entry.rank,
//                 timestamp: fetchedAt,
//             };
//         }
//     } while (nextUrl);
// }

// type SteamProfileResponse = {
//     profile: {
//         steamID64: string; // steamId
//         steamID: string; // steamName
//         avatarIcon: string;
//         avatarMedium: string;
//         avatarFull: string;
//     };
// };

// type PlayerProfileData = {
//     steamName?: string;
//     steamAvatarIcon?: string;
//     steamAvatarMedium?: string;
//     steamAvatarFull?: string;
// };

// async function getSteamProfileData(steamId: string): Promise<PlayerProfileData> {
//     const response = await axios.get<string>(buildSteamProfileUrl(steamId), { responseType: "text" });

//     const object: SteamProfileResponse = parser.parse(response.data);

//     return {
//         steamName: object.profile?.steamID,
//         steamAvatarIcon: object.profile.avatarIcon,
//         steamAvatarMedium: object.profile.avatarMedium,
//         steamAvatarFull: object.profile.avatarFull,
//     };
// }

// async function updateRankAndEloSamples() {
//     for await (const playerSample of scrollAllGlobalLeaderboardPlayerSamples()) {
//         const player = await db
//             .insertInto("Player")
//             .values({
//                 steamId: playerSample.steamId,
//                 rankSamples: [playerSample.rank],
//                 rankSamplesTimestamps: [playerSample.timestamp] as any, // wtf
//                 eloSamples: [playerSample.elo],
//                 eloSamplesTimestamps: [playerSample.timestamp] as any, // wtf x2
//             })
//             .onConflict((oc) => oc.column("steamId").doUpdateSet(({ ref, val }) => {
//                 return {
//                     rankSamples: sql`array_append(${ref("Player.rankSamples")}, ${playerSample.rank})`,
//                     rankSamplesTimestamps: sql`array_append(${ref("Player.rankSamplesTimestamps")}, ${val(playerSample.timestamp.toISOString())})`,
//                     eloSamples: sql`array_append(${ref("Player.eloSamples")}, ${playerSample.elo})`,
//                     eloSamplesTimestamps: sql`array_append(${ref("Player.eloSamplesTimestamps")}, ${val(playerSample.timestamp.toISOString())})`,
//                 };
//             }))
//             .returningAll()
//             .executeTakeFirstOrThrow();

//         // const incompletePlayerProfileData = !player.steamName || !player.steamAvatarIcon || !player.steamAvatarMedium || !player.steamAvatarFull;
//         // if (incompletePlayerProfileData) {
//         //     const playerProfileData = await getSteamProfileData(player.steamId);
//         //     await db
//         //         .updateTable("Player")
//         //         .where("Player.steamId", "=", player.steamId)
//         //         .set({
//         //             steamName: playerProfileData.steamName,
//         //             steamAvatarIcon: playerProfileData.steamAvatarIcon,
//         //             steamAvatarMedium: playerProfileData.steamAvatarMedium,
//         //             steamAvatarFull: playerProfileData.steamAvatarFull,
//         //         })
//         //         .execute();
//         // }
//     }
// }

// async function main() {
//     await updateRankAndEloSamples();
// }

// main()
//     .then(async () => {
//         await db.destroy();
//     })
//     .catch(async (e) => {
//         console.error(e);
//         await db.destroy();
//         process.exit(1);
//     });
