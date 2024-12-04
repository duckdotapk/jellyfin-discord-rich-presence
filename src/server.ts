//
// Imports
//

import fastDeepEqual from "fast-deep-equal";
import { DateTime } from "luxon";

import * as ConfigurationLib from "./libs/Configuration.js";
import * as DiscordRpcLib from "./libs/DiscordRpc.js";
import * as JellyfinApiLib from "./libs/JellyfinApi.js";

//
// Script
//

let currentSession: JellyfinApiLib.Session | null = null;

const setActivity = async () =>
{
	const session = await JellyfinApiLib.fetchFirstSession(ConfigurationLib.configuration.jellyfinUsers);

	if (fastDeepEqual(session, currentSession))
	{
		return await DiscordRpcLib.sendPing();
	}

	currentSession = session;
	
	if (session == null || session.PlayState.IsPaused)
	{
		return await DiscordRpcLib.sendActivityFrame(
			{
				type: DiscordRpcLib.ACTIVITY_TYPE.LISTENING,
				details: "Idle",
			});
	}

	const albumArtUrl = ConfigurationLib.configuration.jellyfinUrl + "/Items/" + session.NowPlayingItem.AlbumId + "/Images/Primary";

	const positionSeconds = session.PlayState.PositionTicks / 10_000_000;
	const runtimeSeconds = session.NowPlayingItem.RunTimeTicks / 10_000_000;

	const startDateTime = DateTime.utc().minus({ seconds: positionSeconds });
	const endDateTime = startDateTime.plus({ seconds: runtimeSeconds });

	await DiscordRpcLib.sendActivityFrame(
		{
			type: DiscordRpcLib.ACTIVITY_TYPE.LISTENING,
			details: session.NowPlayingItem.Name,
			state: session.NowPlayingItem.Artists.join(", "),
			assets:
			{
				large_image: albumArtUrl,
				large_text: session.NowPlayingItem.Album,
			},
			timestamps:
			{
				start: startDateTime.toMillis(),
				end: endDateTime.toMillis(),
			},
		});
}

setActivity();

setInterval(setActivity, 5000);