import React, { useState, useEffect } from 'react';

const SpotifyAuth = () => {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [useMockAuth, setUseMockAuth] = useState(false);

  useEffect(() => {
    if (!useMockAuth) {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      let token = window.localStorage.getItem("token");
      
      if (code && !token) {
        // For now, just set a placeholder - you'll need backend for real token exchange
        token = `auth_code_${code.substring(0, 10)}`;
        window.localStorage.setItem("token", token);
        window.history.replaceState({}, '', '/');
      }
      setToken(token);
    }
  }, [useMockAuth]);

  useEffect(() => {
    if (token && token !== 'mock_token' && !token.startsWith('auth_code_')) {
      getUserId(token); // Use getUserId instead of getUser
    } else if (token && token.startsWith('auth_code_')) {
      // For auth code tokens, set a placeholder user and user_id
      setUser({ display_name: 'Spotify User', id: 'placeholder_user_id' });
      window.localStorage.setItem("user_id", 'placeholder_user_id');
    }
  }, [token]);

  const spotifyLogin = () => {
    const clientId = '872fdc54cb6a4dbe9d1d137ca047718c';
    const redirectUri = "http://127.0.0.1:3000/callback";
    const scopes = ['playlist-modify-public'];
    const url = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}`;
    window.location = url;
  };

  const mockLogin = () => {
    setTimeout(() => {
      setToken('mock_token');
      setUser({ display_name: 'John Doe' });
    }, 1000);
  };

  const getUserId = async (access_token) => {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });
    const res = await response.json();
    if(res.error){
      setToken("")
      window.localStorage.removeItem("token")
      return;
    }
    window.localStorage.setItem("user_id", res.id)
    setUser(res); // Also set the full user data
  };

  const getUser = async (token) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const logout = () => {
    setToken("");
    setUser(null);
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("user_id");
  };

  // Login Screen
  if (!token) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl mb-4">Spotify AI</h1>
        
        <div className="mb-4">
          <label className="flex items-center justify-center gap-2 mb-4">
            <input 
              type="checkbox" 
              checked={useMockAuth}
              onChange={(e) => setUseMockAuth(e.target.checked)}
            />
            Use Mock Auth (for testing)
          </label>
        </div>

        <button 
          onClick={useMockAuth ? mockLogin : spotifyLogin}
          className="bg-green-500 text-white px-6 py-2 rounded"
        >
          {useMockAuth ? 'Mock Login' : 'Login To Start'}
        </button>
      </div>
    );
  }

  // ChatGPT Component placeholder
  const ChatGPT = () => (
    <div className="bg-blue-100 p-4 rounded mb-4">
      <h2 className="text-xl font-semibold mb-2">ChatGPT Component</h2>
      <p>This is where your ChatGPT playlist generation will go!</p>
      <p className="text-sm text-gray-600 mt-2">
        User ID stored: {window.localStorage.getItem("user_id")}
      </p>
    </div>
  );

  // Main Screen (after login) - Now shows ChatGPT component
  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Welcome {user?.display_name}</h1>
      
      <button 
        onClick={logout}
        className="bg-red-500 text-white px-6 py-2 rounded mb-4"
      >
        Logout
      </button>
      
      <ChatGPT />
    </div>
  );
};

export default SpotifyAuth;