//
// Imports
//

import { DateTime } from "luxon";

import * as ConfigurationLib from "./libs/Configuration.js";
import * as DiscordRpcLib from "./libs/DiscordRpc.js";
import * as JellyfinApiLib from "./libs/JellyfinApi.js";

//
// Script
//

const setActivity = async () =>
{
	//
	// Await Socket Connected
	//

	if (DiscordRpcLib.socket.connecting)
	{
		console.log("Waiting for socket connection...");

		await new Promise<void>(
			(resolve) =>
			{
				DiscordRpcLib.socket.once("connect",
					() =>
					{
						resolve();
					});
			});

		console.log("Socket connected! Sending handshake...");

		await DiscordRpcLib.sendHandshake();

		console.log("Handshake sent!");
	}

	//
	// Get Session
	//

	const session = await JellyfinApiLib.fetchFirstSession(ConfigurationLib.configuration.jellyfinUsers);

	//
	// Show Idle Activity
	//
	
	if (session == null)
	{
		console.log("No session. Clearing activity...");

		return await DiscordRpcLib.sendActivityFrame(null);
	}

	if (session.PlayState.IsPaused)
	{
		console.log("Paused. Clearing activity...");

		return await DiscordRpcLib.sendActivityFrame(null);
	}

	const isPlayingHiddenAlbum = ConfigurationLib.configuration.hiddenAlbums.includes(session.NowPlayingItem.Album.trim());

	if (isPlayingHiddenAlbum)
	{
		console.log("Hidden album. Clearing activity...");

		return await DiscordRpcLib.sendActivityFrame(null);
	}

	//
	// Show Playing Activity
	//

	const albumArtUrl = ConfigurationLib.configuration.jellyfinUrl + "/Items/" + session.NowPlayingItem.AlbumId + "/Images/Primary";

	const positionSeconds = session.PlayState.PositionTicks / 10_000_000;
	const runtimeSeconds = session.NowPlayingItem.RunTimeTicks / 10_000_000;

	const startDateTime = DateTime.utc().minus({ seconds: positionSeconds });
	const endDateTime = startDateTime.plus({ seconds: runtimeSeconds });

	console.log("Setting activity to " + session.NowPlayingItem.Name + " by " + session.NowPlayingItem.Artists.join(", ") + "...");

	await DiscordRpcLib.sendActivityFrame(
		{
			type: DiscordRpcLib.ACTIVITY_TYPE.LISTENING,
			details: session.NowPlayingItem.Name,
			state: session.NowPlayingItem.Artists.map((artist) => artist.trim()).join(", "),
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