import React, { useState } from 'react';

const ChatGPT = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    // TODO: Implement OpenAI API call
    setIsLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Generate Playlist</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Describe your playlist:
          </label>
          <textarea
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: Create a workout playlist with upbeat songs from the 80s and 90s"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className={`w-full py-2 px-4 rounded-lg font-bold text-white ${
            isLoading || !prompt.trim() 
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isLoading ? 'Generating...' : 'Generate Playlist'}
        </button>
      </form>
      
      {response && (
        <div className="mt-6">
          <h3 className="font-bold mb-2">Generated Playlist:</h3>
          <div className="bg-gray-100 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap">{response}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatGPT; 