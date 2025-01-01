import { Elysia, t } from 'elysia';
import { db } from '../../../../common/db/index.js';
import { zip } from 'radash';
import { sql } from 'kysely';

const routes = new Elysia({ prefix: '/stats/user' })
    .get('/:id', async ({ params: { id } }) => {
        const maxSamples = 100;

        const player = await db
            .selectFrom("Player")
            .where("id", "=", id)
            .select(({ lit }) => [
                "id",
                "steamId",
                "steamName",
                "steamAvatarFull",
                sql<number[]>`"rankSamples"[array_length("rankSamples", 1) - ${lit(maxSamples - 1)}:]`.as("rankSamples"),
                sql<Date[]>`"rankSamplesTimestamps"[array_length("rankSamplesTimestamps", 1) - ${lit(maxSamples - 1)}:]`.as("rankSamplesTimestamps"),
                sql<number[]>`"eloSamples"[array_length("eloSamples", 1) - ${lit(maxSamples - 1)}:]`.as("eloSamples"),
                sql<Date[]>`"eloSamplesTimestamps"[array_length("eloSamplesTimestamps", 1) - ${lit(maxSamples - 1)}:]`.as("eloSamplesTimestamps"),
            ]).executeTakeFirstOrThrow();

        const rankSamples = zip(player.rankSamples, player.rankSamplesTimestamps).map(([rank, timestamp]) => ({ rank, timestamp: timestamp as unknown as Date }));
        const eloSamples = zip(player.eloSamples, player.eloSamplesTimestamps).map(([elo, timestamp]) => ({ elo, timestamp: timestamp as unknown as Date }));

        return {
            id: player.id,
            steamId: player.steamId,
            steamName: player.steamName,
            steamAvatarUrl: player.steamAvatarFull,
            rankSamples,
            eloSamples,
        };
    }, {
        params: t.Object({
            id: t.Number()
        }),
        response: t.Object({
            id: t.Number(),
            steamId: t.String(),
            steamName: t.Nullable(t.String()),
            steamAvatarUrl: t.Nullable(t.String()),
            rankSamples: t.Array(t.Object({
                rank: t.Number(),
                timestamp: t.Date(),
            })),
            eloSamples: t.Array(t.Object({
                elo: t.Number(),
                timestamp: t.Date(),
            }))
        }),
    });

export default routes;