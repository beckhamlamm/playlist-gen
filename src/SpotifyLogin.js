import React from "react";

const CLIENT_ID = "your_spotify_client_id";
const REDIRECT_URI = "http://127.0.0.1:3000/callback";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";
const SCOPE = "playlist-modify-public playlist-modify-private";

const SpotifyLogin = () => {
  const handleLogin = () => {
    window.location = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${encodeURIComponent(SCOPE)}`;
  };

  return (
    <div>
      <h1>Personalized Playlist Generator</h1>
      <button onClick={handleLogin}>Login with Spotify</button>
    </div>
  );
};

export default SpotifyLogin;
