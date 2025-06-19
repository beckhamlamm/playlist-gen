import React from 'react';
import { FaPlus } from 'react-icons/fa';
import createPlaylist from '../hooks/createPlaylist';

// Component for displaying and creating Spotify playlists
const SpotifyPlaylist = ({ playlistArray }) => {
    return (
        // Main container for playlist display
        <div className="playlist-container">
            {/* Header section with title and create playlist button */}
            <div className="playlist-header">
                <h3>Generated Playlist</h3>
                <button 
                    onClick={() => createPlaylist({ playlistArray })}
                    className="create-playlist-button"
                >
                    Create Playlist <FaPlus />
                </button>
            </div>
            {/* Table displaying the playlist songs */}
            <table className="playlist-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Title</th>
                        <th>Album</th>
                        <th>Duration</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Map through songs array to create table rows */}
                    {playlistArray.map((song, index) => (
                        <tr key={song.id || index}>
                            <td>{song.id}</td>
                            <td>
                                {song.title}<br/>
                                <span className="artist-name">{song.artist}</span>
                            </td>
                            <td>{song.album}</td>
                            <td>{song.duration}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default SpotifyPlaylist; 