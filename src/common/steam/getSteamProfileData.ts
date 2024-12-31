import axios from "axios";
import { buildSteamProfileUrl } from "./constants/index.js";
import { XMLParser } from "fast-xml-parser";

class SteamProfileNotFound extends Error { }

type SteamProfileResponse = {
    profile?: {
        steamID64: string; // steamId
        steamID: string; // steamName
        avatarIcon: string;
        avatarMedium: string;
        avatarFull: string;
    };
    response?: {
        error: string;
    };
};

type PlayerProfileData = {
    steamName?: string;
    steamAvatarIcon?: string;
    steamAvatarMedium?: string;
    steamAvatarFull?: string;
};

const parser = new XMLParser();

export async function getSteamProfileData(steamId: string): Promise<PlayerProfileData> {
    const response = await axios.get<string>(buildSteamProfileUrl(steamId), { responseType: "text" });

    const object: SteamProfileResponse = parser.parse(response.data);

    if (object.response?.error) throw new SteamProfileNotFound();

    return {
        steamName: object.profile?.steamID,
        steamAvatarIcon: object.profile?.avatarIcon,
        steamAvatarMedium: object.profile?.avatarMedium,
        steamAvatarFull: object.profile?.avatarFull,
    };
}