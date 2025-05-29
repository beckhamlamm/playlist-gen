import React, { useState } from "react";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [songCount, setSongCount] = useState("10");

  const handleGenerate = () => {
    console.log("Generating playlist for:", prompt, songCount);
  };

  return (
    <div className="min-h-screen bg-[#081c24] text-white flex flex-col items-center justify-center px-4 py-8 font-sans">
      {/* GitHub Link */}
      <div className="w-full max-w-3xl mb-12">
        <div className="flex justify-between items-center">
          <a href="https://github.com/beckhamlamm/playlist-gen" target="_blank" rel="noopener noreferrer" className="text-white hover:underline text-sm">GitHub</a>
          <button className="text-white hover:underline text-sm">Logout ↗</button>
        </div>
      </div>

      {/* Project Title */}
      <h1 className="text-5xl font-bold mb-4">Spotify AI <span className="text-green-400">🎵</span></h1>

      {/* Playlist Type Buttons */}
      <div className="flex space-x-4 mb-6">
        <button className="bg-[#173b4c] px-6 py-2 rounded-md text-white font-medium hover:bg-[#1c4a5e]">Song Radio Playlist</button>
        <button className="bg-green-600 px-6 py-2 rounded-md text-white font-medium hover:bg-green-700">Wild Card Playlist</button>
      </div>

      {/* Input and Select */}
      <div className="flex flex-col sm:flex-row items-center w-full max-w-xl gap-4 mb-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder='Eg: Game soundtracks similar to "Crypt of the Necrodancer"'
          className="w-full px-4 py-2 rounded-md text-black"
        />
        <select
          value={songCount}
          onChange={(e) => setSongCount(e.target.value)}
          className="px-3 py-2 rounded-md text-black"
        >
          <option value="10">10 songs</option>
          <option value="15">15 songs</option>
          <option value="20">20 songs</option>
          <option value="25">25 songs</option>
          <option value="30">30 songs</option>
        </select>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-md font-semibold"
      >
        Generate →
      </button>
    </div>
  );
}