import axios from "axios";

const createPlaylist = async ({ playlistArray }) => {
    const access_token = window.localStorage.getItem("token");
    const user_id = window.localStorage.getItem("user_id");
    const playlist_name = "New Spotify AI Playlist";
    const playlist_description = "Some groovy songs found with the help of AI";

    try {
        // Create a new playlist
        const playlistResponse = await axios.post(
            `https://api.spotify.com/v1/users/${user_id}/playlists`,
            {
                name: playlist_name,
                description: playlist_description,
                public: true,
            },
            {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        // Get the ID of the newly created playlist
        const playlist_id = playlistResponse.data.id;

        // Initialize array for track_uris to be added
        const track_uris = [];
        const requests = playlistArray.map((song) => {
            // Search for the songs on Spotify
            return axios.get(
                `https://api.spotify.com/v1/search?q=name:${encodeURIComponent(
                    song.title
                )}album:${encodeURIComponent(song.album)}artist:${encodeURIComponent(
                    song.artist
                )}&type=track`,
                {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                        "Content-Type": "application/json",
                    },
                }
            ).then((response) => {
                if (response.data.tracks.items.length > 0) {
                    // Get the URI of the first search result
                    const track_uri = response.data.tracks.items[0].uri;
                    track_uris.push(track_uri);
                } else {
                    console.log(`Could not find track: ${song.title} by ${song.artist}`);
                }
            });
        });

        // Wait for all the search requests to finish
        await Promise.all(requests);

        // Add all found tracks to the playlist
        if (track_uris.length > 0) {
            await axios.post(
                `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`,
                {
                    uris: track_uris,
                },
                {
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log(`New Spotify Playlist "${playlist_name}" created!`);
        } else {
            console.log("No tracks were found to add to the playlist.");
        }
    } catch (error) {
        console.error("Error creating playlist:", error.response?.data || error.message);
    }
};

export default createPlaylist; 