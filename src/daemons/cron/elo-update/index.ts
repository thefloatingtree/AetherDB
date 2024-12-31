import "dotenv/config";

import { sql } from "kysely";
import { scrollAllGlobalLeaderboardPlayerSamples } from "../../../common/steam/scrollAllGlobalLeaderboardPlayerSamples.js";
import { db } from "../../../common/db/index.js";
import { getSteamProfileData } from "../../../common/steam/getSteamProfileData.js";


async function updateRankAndEloSamples() {
    for await (const playerSample of scrollAllGlobalLeaderboardPlayerSamples()) {
        const player = await db
            .insertInto("Player")
            .values({
                steamId: playerSample.steamId,
                rankSamples: [playerSample.rank],
                rankSamplesTimestamps: [playerSample.timestamp] as any, // wtf
                eloSamples: [playerSample.elo],
                eloSamplesTimestamps: [playerSample.timestamp] as any, // wtf x2
            })
            .onConflict((oc) => oc.column("steamId").doUpdateSet(({ ref, val }) => {
                return {
                    rankSamples: sql`array_append(${ref("Player.rankSamples")}, ${playerSample.rank})`,
                    rankSamplesTimestamps: sql`array_append(${ref("Player.rankSamplesTimestamps")}, ${val(playerSample.timestamp.toISOString())})`,
                    eloSamples: sql`array_append(${ref("Player.eloSamples")}, ${playerSample.elo})`,
                    eloSamplesTimestamps: sql`array_append(${ref("Player.eloSamplesTimestamps")}, ${val(playerSample.timestamp.toISOString())})`,
                };
            }))
            .returningAll()
            .executeTakeFirstOrThrow();

        console.log(`Updated elo and rank for ${player.steamId} (${playerSample.rank})`);

        const incompletePlayerProfileData = !player.steamName || !player.steamAvatarIcon || !player.steamAvatarMedium || !player.steamAvatarFull;
        if (incompletePlayerProfileData) {
            const playerProfileData = await getSteamProfileData(player.steamId);
            await db
                .updateTable("Player")
                .where("Player.steamId", "=", player.steamId)
                .set({
                    steamName: playerProfileData.steamName,
                    steamAvatarIcon: playerProfileData.steamAvatarIcon,
                    steamAvatarMedium: playerProfileData.steamAvatarMedium,
                    steamAvatarFull: playerProfileData.steamAvatarFull,
                })
                .execute();

            console.log(`Updated profile data for ${player.steamId}`);
        }
    }
}

async function main() {
    await updateRankAndEloSamples();
}

main()
    .then(async () => {
        await db.destroy();
    })
    .catch(async (e) => {
        console.error(e);
        await db.destroy();
        process.exit(1);
    });
