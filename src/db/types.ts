import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type Player = {
    id: Generated<number>;
    steamId: string;
    steamAvatarIcon: string | null;
    steamAvatarMedium: string | null;
    steamAvatarFull: string | null;
    steamName: string | null;
    rankSamples: number[];
    rankSamplesTimestamps: Timestamp[];
    eloSamples: number[];
    eloSamplesTimestamps: Timestamp[];
};
export type DB = {
    Player: Player;
};
