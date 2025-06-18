import React, { useState, useEffect } from 'react';
import './App.css';
import ChatGPT from './components/ChatGPT';

const App = () => {
  // State variables
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });
  
  // Spotify credentials
  const CLIENT_ID = '872fdc54cb6a4dbe9d1d137ca047718c';
  const REDIRECT_URI = "http://127.0.0.1:5173/callback";

  useEffect(() => {
    // Initialize auth: Checks URL for Spotify code or existing token
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

  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Exchange Spotify auth code for access token
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
      
      await new Promise(resolve => setTimeout(resolve, 100));
      window.location.href = '/';
    } catch (error) {
      console.error('Error getting access token:', error);
      window.location.href = '/';
    }
  };

  // PKCE authentication helpers
  // Creates SHA-256 hash of verifier for PKCE auth
  const generateCode = async (verifier) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  };

  // Generates random string for PKCE verification
  const generateCodeVerifier = () => {
    const array = new Uint32Array(56/2);
    window.crypto.getRandomValues(array);
    return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
  };

  // Fetch Spotify user profile using access token
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

  // Start Spotify auth flow with PKCE security
  const spotifyLogin = async () => {
    try {
      const verifier = generateCodeVerifier();
      const challenge = await generateCode(verifier);
      
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

  // Clear all auth data and reset state
  const logout = () => {
    setToken("");
    setUser(null);
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("user_id");
    window.localStorage.removeItem("verifier");
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  // Loading Screen
  if (isLoading) {
    return (
      <div className="container">
        <h1>Loading...</h1>
      </div>
    );
  }

  // Login Screen
  if (!token) {
    return (
      <>
        <div className="container">
          <div className="header">
            <a
              href="https://github.com/beckhamlamm/playlist-gen/tree/main"
              target="_blank"
              rel="noopener noreferrer"
              className="github-link"
            >
              <svg height="24" width="24" viewBox="0 0 16 16" style={{fill: 'currentColor'}}>
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
              </svg>
              GitHub
            </a>
          </div>

          <div className="main-content">
            <h1 className="title">Spotify AI</h1>
            <button 
              onClick={spotifyLogin}
              className="login-button"
            >
              Login with Spotify
            </button>
          </div>

          <div className="footer">
            <button 
              onClick={logout}
              className="clear-data-button"
            >
              Clear stored data
            </button>
          </div>
        </div>
        <button
          className="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? 'Dark' : 'Light'}
        </button>
      </>
    );
  }

  // Main Screen (after login)
  return (
    <>
      <div className="container">
        <div className="header">
          <a
            href="https://github.com/beckhamlamm/playlist-gen/tree/main"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
          >
            <svg height="24" width="24" viewBox="0 0 16 16" style={{fill: 'currentColor'}}>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
            </svg>
            GitHub
          </a>
          <p className="welcome-message">Welcome, {user?.display_name || 'User'}</p>
          <div className="user-section">
            <button 
              onClick={logout}
              className="logout-button"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="main-content">
          <ChatGPT />
        </div>

        <div className="footer">
          <button 
            onClick={logout}
            className="clear-data-button"
          >
            Clear stored data
          </button>
        </div>
      </div>
      <button
        className="theme-toggle-btn"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {theme === 'dark' ? 'Dark' : 'Light'}
      </button>
    </>
  );
};

export default App;
