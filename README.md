# Jellyfin Discord Rich Presence
A simple script that will show what music you're currently listening to on Jellyfin on Discord.

**Note**: Currently other types of media are not currently supported (and might never be), I mostly made this for myself and I personally only use Jellyfin for music.

**Note**: Currently only tested with on Windows 11 with Node.js 22.5.1.

## Installation

1. Clone this repo
2. Run `cd` to change repo directory
3. Run `npm install`
4. Run `npm run build`
5. Create a `configuration.yaml` file in the working directory (see below)
6. Run `node ./build/server.js`

## Configuration
The script will load `configuration.yaml` from the working directory. Here's an example of one:
```yaml
# URL to your Jellyfin server
# This needs to be publicly accessible for album art to work
jellyfinUrl: "http://192.168.1.69:8096"

# API key for your Jellyfin server
# You can create one in the Jellyfin dashboard
jellyfinApiKey: "00000000000000000000000000000000"

# Users whose sessions will be used for the rich presence
# It will just take the first session it finds that's for music atm
jellyfinUsers:
- "loren"

# Discord client ID
# Optional, I provide a default one but the option is here if you want to use your own
discordClientId: "1313877917134229524"
```

## License
[MIT](https://github.com/duckdotapk/jellyfin-discord-rich-presence/blob/main/LICENSE.md)