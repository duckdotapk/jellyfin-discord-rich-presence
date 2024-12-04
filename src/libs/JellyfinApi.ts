//
// Imports
//

import { z } from "zod";

import { configuration } from "./Configuration.js";

//
// Types
//

export type Session = z.infer<typeof SessionSchema>;

//
// Schemas
//

// TODO: I have no idea if any of these fields can be null
export const SessionSchema = z.object(
	{
		UserName: z.string(),

		NowPlayingItem: z.object(
			{
				Id: z.string(),

				// TODO: the rest of possible type values
				Type: z.enum([ "Audio" ]),
		
				Album: z.string(),
				AlbumId: z.string(),
		
				Artists: z.array(z.string()),
				Name: z.string(),
				ProductionYear: z.number(),
				RunTimeTicks: z.number(),
		
				// TODO: other fields
			}),

		PlayState: z.object(
			{
				IsPaused: z.boolean(),
				PositionTicks: z.number(),
		
				// TODO: other fields
			}),

		// TODO: other fields
	});

//
// Utility Functions
//

export async function fetchFirstSession(usernames: string[]): Promise<Session | null>
{
	const headers = new Headers();

	headers.set("X-Emby-Token", configuration.jellyfinApiKey);

	const response = await fetch(configuration.jellyfinUrl + "/Sessions",
		{
			headers,
		});

	const responseJson = await response.json();

	const rawSessions = z.array(z.unknown()).parse(responseJson);

	for (const rawSession of rawSessions)
	{
		// Note: Parsed individually so one session
		//	having unexpected fields doesn't 
		//	tank the whole application
		const sessionParseResult = SessionSchema.safeParse(rawSession);

		if (!sessionParseResult.success)
		{
			continue;
		}

		const session = sessionParseResult.data;

		if (!usernames.includes(session.UserName))
		{
			continue;
		}

		if (session.NowPlayingItem.Type != "Audio")
		{
			continue;
		}

		return session;
	}

	return null;
}