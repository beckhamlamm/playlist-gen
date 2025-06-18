import React, { useState } from 'react';
import { ImArrowRight2 } from 'react-icons/im';
import axios from 'axios';
import LoadingBar from './LoadingBar';
import SpotifyPlaylist from './SpotifyPlaylist';

const WildCard = () => {
    const [input, setInput] = useState("");
    const [length, setLength] = useState(10);
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(null);

    const generatePlaylist = async () => {
        if (!input.trim()) {
            setError("Please enter a description for your playlist");
            return;
        }

        setLoading(true);
        setLoaded(false);
        setError(null);

        const payload = {
            temperature: 0.7,
            max_tokens: 3000,
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: `You are a music playlist generator. You MUST respond with ONLY a valid JSON array of songs. 
                    Each song in the array must have these exact fields: "id" (number), "title" (string), "artist" (string), 
                    "album" (string), "duration" (string in format "M:SS"). Do not include any other text or explanation in your response.`
                },
                {
                    role: "user",
                    content: `Generate a playlist of ${length} songs based on: "${input}"`
                }
            ]
        };

        try {
            console.log("Sending request to OpenAI...");
            const response = await axios({
                method: "POST",
                url: "https://api.openai.com/v1/chat/completions",
                data: payload,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${import.meta.env.VITE_OPENAI_KEY}`
                }
            });

            if (response.status === 200 && response.data.choices && response.data.choices[0]) {
                const content = response.data.choices[0].message.content;
                console.log("Raw response from OpenAI:", content);

                try {
                    // Try to clean the response if it contains any markdown code blocks
                    let jsonContent = content;
                    if (content.includes('```json')) {
                        jsonContent = content.split('```json')[1].split('```')[0].trim();
                    } else if (content.includes('```')) {
                        jsonContent = content.split('```')[1].split('```')[0].trim();
                    }

                    const parsedSongs = JSON.parse(jsonContent);
                    console.log("Parsed songs:", parsedSongs);

                    if (Array.isArray(parsedSongs)) {
                        // Validate the structure of each song
                        const validSongs = parsedSongs.every(song => 
                            song.id && 
                            song.title && 
                            song.artist && 
                            song.album && 
                            song.duration
                        );

                        if (validSongs) {
                            setSongs(parsedSongs);
                            setLoaded(true);
                            setError(null);
                        } else {
                            throw new Error("Invalid song structure in response");
                        }
                    } else {
                        throw new Error("Response is not an array");
                    }
                } catch (parseError) {
                    console.error("Parse error:", parseError);
                    console.error("Attempted to parse content:", content);
                    setError("Failed to parse the AI response. Please try again.");
                }
            } else {
                throw new Error("Invalid response from OpenAI");
            }
        } catch (error) {
            console.error("API error:", error);
            console.error("Error response:", error.response?.data);
            setError(error.response?.data?.error?.message || "Failed to generate playlist. Please try again.");
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="wildcard-outer">
            <div className="wildcard-center-content">
                <h1 className="title">Spotify AI</h1>
                {error && <p className="error-message">{error}</p>}
                <div>
                    <input 
                        type='text' 
                        onChange={(e) => setInput(e.target.value)} 
                        placeholder='Eg: Game soundtracks similar to "Crypt of the Necrodancer"'
                        value={input}
                        onKeyDown={e => { if (e.key === 'Enter') generatePlaylist(); }}
                    /> 
                    <select
                        value={length}
                        onChange={e => setLength(Number(e.target.value))}
                        style={{ marginLeft: '0.5rem', borderRadius: '2rem', padding: '0.7rem 2rem', fontSize: '1.1rem', border: '1.5px solid #bbb', background: '#f5f5f5', boxShadow: '0 2px 8px rgba(60,60,60,0.08)', color: '#222', outline: 'none' }}
                    >
                        <option value={10}>10 songs</option>
                        <option value={15}>15 songs</option>
                        <option value={20}>20 songs</option>
                        <option value={25}>25 songs</option>
                        <option value={30}>30 songs</option>
                        <option value={35}>35 songs</option>
                        <option value={40}>40 songs</option>
                        <option value={45}>45 songs</option>
                        <option value={50}>50 songs</option>
                    </select>
                </div>
                <button 
                    onClick={generatePlaylist}
                    disabled={loading || !input.trim()}
                >
                    {loading ? 'Generating...' : 'Generate'}
                </button>
                {loading ? <LoadingBar /> : null}
                {loaded && songs.length > 0 ? <SpotifyPlaylist playlistArray={songs} /> : null}
            </div>
        </div>
    );
};

export default WildCard; 