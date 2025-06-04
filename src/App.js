import React, { useState, useEffect } from 'react';

const SpotifyAuth = () => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);

  const CLIENT_ID = '872fdc54cb6a4dbe9d1d137ca047718c';
  const REDIRECT_URI = 'http://127.0.0.1:3000/callback';
  const SCOPES = 'user-read-private playlist-modify-public playlist-modify-private';

  const login = () => {
    const authUrl = `https://accounts.spotify.com/authorize?` +
      `client_id=${CLIENT_ID}&` +
      `response_type=code&` +
      `redirect_uri=${REDIRECT_URI}&` +
      `scope=${SCOPES}`;
    
    window.location.href = authUrl;
  };

  const getTokenFromUrl = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      // Note: In production, do this on your backend
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: REDIRECT_URI,
          client_id: CLIENT_ID,
          // client_secret: 'your_client_secret' // Backend only
        })
      });

      const data = await response.json();
      if (data.access_token) {
        setAccessToken(data.access_token);
        window.history.replaceState({}, '', '/');
      }
    }
  };

  const getUser = async (token) => {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const userData = await response.json();
    setUser(userData);
  };

  useEffect(() => {
    getTokenFromUrl();
  }, []);

  useEffect(() => {
    if (accessToken) {
      getUser(accessToken);
    }
  }, [accessToken]);

  if (!accessToken) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl mb-4">AI Playlist Generator</h1>
        <button 
          onClick={login}
          className="bg-green-500 text-white px-6 py-2 rounded"
        >
          Login with Spotify
        </button>
      </div>
    );
  }

  const logout = () => {
    setAccessToken(null);
    setUser(null);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Welcome {user?.display_name}</h1>
      <p className="mb-4">Access Token: {accessToken.substring(0, 20)}...</p>
      
      <button 
        onClick={logout}
        className="bg-red-500 text-white px-6 py-2 rounded mb-4"
      >
        Logout
      </button>
      
      {/* Add your playlist generation features here */}
      <div className="bg-gray-100 p-4 rounded">
        <p>Ready to build! Token is available for Spotify API calls.</p>
      </div>
    </div>
  );
};

export default SpotifyAuth;