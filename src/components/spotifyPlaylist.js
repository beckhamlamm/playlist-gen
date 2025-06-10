import React from 'react';
import { FaPlus } from 'react-icons/fa';
import createPlaylist from '../hooks/createPlaylist';

const SpotifyPlaylist = ({ playlistArray }) => {
    return (
        <div className="playlist-container">
            <div className="playlist-header">
                <h3>Generated Playlist</h3>
                <button 
                    onClick={() => createPlaylist({ playlistArray })}
                    className="create-playlist-button"
                >
                    Create Playlist <FaPlus />
                </button>
            </div>
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