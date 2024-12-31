import "dotenv/config";

import { sql } from "kysely";
import { scrollAllGlobalLeaderboardPlayerSampleChunks, PlayerSample } from "../../../common/steam/scrollAllGlobalLeaderboardPlayerSampleChunks.js";
import { db } from "../../../common/db/index.js";
import { getSteamProfileData } from "../../../common/steam/getSteamProfileData.js";
import { parallel, sift, tryit } from "radash";


async function processPlayerSample(playerSample: PlayerSample) {
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
        const [_, playerProfileData] = await tryit(getSteamProfileData)("76561199800831097");
        if (playerProfileData) {
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
    for await (const playerSamples of scrollAllGlobalLeaderboardPlayerSampleChunks()) {
        const [errors] = await tryit(parallel)(10, playerSamples, processPlayerSample);
        if (errors) {
            console.log({
                errors: sift((errors as AggregateError).errors)
            });
        }
    }
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
