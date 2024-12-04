//
// Imports
//

import fs from "node:fs";

import yaml from "yaml";
import { z } from "zod";

//
// Schemas
//

export const ConfigurationSchema = z.object(
	{
		jellyfinUrl: z.string(),
		jellyfinApiKey: z.string(),
		jellyfinUsers: z.array(z.string()),

		discordClientId: z.string().default("1313877917134229524"),
	});

//
// Constants
//

export const configuration = ConfigurationSchema.parse(yaml.parse(fs.readFileSync("configuration.yaml", "utf8")));