import React, { useState, useEffect } from 'react';
import './App.css';
import ChatGPT from './components/ChatGPT';

const App = () => {
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const CLIENT_ID = '872fdc54cb6a4dbe9d1d137ca047718c';
  const REDIRECT_URI = "http://127.0.0.1:3000/callback";

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const isCallback = window.location.pathname === '/callback';
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const storedToken = window.localStorage.getItem("token");
        
        if (isCallback && code) {
          await getAccessToken(code);
        } else if (storedToken) {
          setToken(storedToken);
          await getUserId(storedToken);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const getAccessToken = async (code) => {
    try {
      const verifier = localStorage.getItem('verifier');
      
      const params = new URLSearchParams();
      params.append("client_id", CLIENT_ID);
      params.append("grant_type", "authorization_code");
      params.append("code", code);
      params.append("redirect_uri", REDIRECT_URI);
      params.append("code_verifier", verifier);

      const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
      });

      const { access_token } = await result.json();
      if (!access_token) {
        throw new Error('No access token received');
      }

      window.localStorage.setItem("token", access_token);
      setToken(access_token);
      
      // Instead of redirecting immediately, wait for token to be set
      await new Promise(resolve => setTimeout(resolve, 100));
      window.location.href = '/';
    } catch (error) {
      console.error('Error getting access token:', error);
      window.location.href = '/';
    }
  };

  const generateCodeChallenge = async (verifier) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  };

  const generateCodeVerifier = () => {
    const array = new Uint32Array(56/2);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
  };

  const getUserId = async (access_token) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user info');
      }
      
      const res = await response.json();
      if(res.error){
        throw new Error(res.error.message);
      }
      
      window.localStorage.setItem("user_id", res.id);
      setUser(res);
    } catch (error) {
      console.error('Error fetching user:', error);
      setToken("");
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("user_id");
    }
  };

  const spotifyLogin = async () => {
    try {
      const verifier = generateCodeVerifier();
      const challenge = await generateCodeChallenge(verifier);
      
      localStorage.setItem('verifier', verifier);
      
      const params = new URLSearchParams();
      params.append("client_id", CLIENT_ID);
      params.append("response_type", "code");
      params.append("redirect_uri", REDIRECT_URI);
      params.append("scope", "playlist-modify-public");
      params.append("code_challenge_method", "S256");
      params.append("code_challenge", challenge);
      
      window.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = () => {
    setToken("");
    setUser(null);
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("user_id");
    window.localStorage.removeItem("verifier");
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl mb-4">Loading...</h1>
      </div>
    );
  }

  // Login Screen
  if (!token) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl mb-4">Spotify AI</h1>
        <div className="space-y-4">
          <button 
            onClick={spotifyLogin}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600"
          >
            Login with Spotify
          </button>
          <div>
            <button 
              onClick={logout}
              className="text-red-500 underline text-sm"
            >
              Clear stored data
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Screen (after login)
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl">Welcome {user?.display_name || 'User'}</h1>
        <button 
          onClick={logout}
          className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      <ChatGPT />
    </div>
  );
};

export default App;