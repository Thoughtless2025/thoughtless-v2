import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_BASE;

function App() {
  const [status, setStatus] = useState('Loading...');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${API_BASE}/oauth/status`);
        const data = await response.json();
        if (data.connected) {
          setStatus('Connected');
          setConnected(true);
        } else {
          setStatus('Disconnected');
          setConnected(false);
        }
      } catch (error) {
        setStatus('Error');
      }
    };
    checkStatus();
  }, []);

  const connectGemini = async () => {
    try {
      const response = await fetch(`${API_BASE}/oauth/config`);
      const config = await response.json();
      const params = new URLSearchParams({
        client_id: config.client_id,
        redirect_uri: config.redirect_uri,
        response_type: 'code',
        scope: config.scope,
        access_type: 'offline',
        prompt: 'consent',
      });
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
      window.open(authUrl, 'oauth', 'width=500,height=600');
    } catch (error) {
      setStatus('Error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold mb-4">Thoughtless v2</h1>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <div className="flex items-center mb-4">
          <div className={`w-4 h-4 rounded-full mr-2 ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <p className="text-lg">{status}</p>
        </div>
        <button
          onClick={connectGemini}
          disabled={connected}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Connect to Gemini
        </button>
      </div>
    </div>
  );
}

export default App;