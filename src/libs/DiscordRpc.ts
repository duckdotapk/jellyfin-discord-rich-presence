//
// Imports
//

import net from "node:net";

import { configuration } from "./Configuration.js";

//
// Types
//

export type Activity =
{
	type?: number;
	details?: string;
	state?: string;
	assets?:
	{
		large_image?: string;
		large_text?: string;
		small_image?: string;
		small_text?: string;
	};
	timestamps?:
	{
		start?: number;
		end?: number;
	};
};

//
// Constants
//

export const ACTIVITY_TYPE =
{
	PLAYING: 0,
	STREAMING: 1,
	LISTENING: 2,
	WATCHING: 3,
	CUSTOM: 4,
	COMPETING: 5,
};

const discordPipe = process.platform === "win32" 
    ? "\\\\.\\pipe\\discord-ipc-0" 
    : "/run/user/1000/discord-ipc-0"; // TODO: don't hardcode the user id!

const opCodes =
{
	HANDSHAKE: 0,
	FRAME: 1,
	CLOSE: 2,
	PING: 3,
	PONG: 4,
};

export const socket = net.createConnection(discordPipe);

//
// Utility Functions
//

function createPacket(opCode: number, payload: any)
{
    const data = JSON.stringify(payload);

    const length = Buffer.byteLength(data);

    const packet = Buffer.alloc(8 + length);

    packet.writeInt32LE(opCode, 0);

    packet.writeInt32LE(length, 4);

    packet.write(data, 8);

    return packet;
}

async function writeSocket(opCode: number, payload: any)
{
	return new Promise<void>(
		(resolve, reject) =>
		{
			socket.write(createPacket(opCode, payload),
				(error) =>
				{
					error != undefined ? reject(error) : resolve();
				});
		});
}

export async function sendHandshake()
{
	const handshakePayload =
	{
		v: 1,
		client_id: configuration.discordClientId,
	};

	await writeSocket(opCodes.HANDSHAKE, handshakePayload);
}

export async function sendActivityFrame(activity: Activity | null)
{
	const activityPayload =
	{
		cmd: "SET_ACTIVITY",
		args:
		{
			pid: process.pid,
			activity,
		},
		nonce: Math.random().toString(36).substring(2),
	};

	await writeSocket(opCodes.FRAME, activityPayload);
}