import { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from './firebase';
import './App.css';

const API_URL = '/api';

function App() {
  console.log("App component is rendering");
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState('gemini');
  const [model, setModel] = useState('gemini-pro');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        checkConnectionStatus(currentUser);
      }
    });
    return () => unsubscribe();
  }, []);

  const checkConnectionStatus = async (currentUser: User) => {
    const token = await currentUser.getIdToken();
    const res = await fetch(`${API_URL}/oauth/status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setIsConnected(data.connected);
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in:', error);
      setError("Failed to sign in.");
    }
  };

  const handleConnect = async () => {
    if (!user) return;
    const token = await user.getIdToken();
    const res = await fetch(`${API_URL}/oauth/config`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const config = await res.json();

    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${config.client_id}&redirect_uri=${config.redirect_uri}&response_type=code&scope=${config.scope}&access_type=offline&prompt=consent`;

    const oauthWindow = window.open(oauthUrl, '_blank', 'width=500,height=600');

    const checkWindow = setInterval(() => {
        if (oauthWindow && oauthWindow.closed) {
            clearInterval(checkWindow);
            checkConnectionStatus(user);
        }
    }, 1000);

  };

  const handleSendMessage = async () => {
    if (!user || !message) return;
    setLoading(true);
    setError(null);
    const token = await user.getIdToken();
    try {
      const res = await fetch(`${API_URL}/chatbots/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ provider, model, message }),
      });
      const data = await res.json();
      if (res.ok) {
        setResponse(data);
      } else {
        setError(data.error || "An unknown error occurred.");
      }
    } catch (err) {
      setError("Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl p-8 bg-white rounded-lg shadow-md">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Thoughtless v2</h1>
          <p className="text-gray-600">A new way to interact with AI</p>
        </header>
        {user ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <p className="text-lg">Welcome, {user.displayName}</p>
              {!isConnected ? (
                  <button onClick={handleConnect} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">Connect to Gemini</button>
              ) : (
                  <p className="text-green-500 font-semibold">Connected to Gemini</p>
              )}
            </div>
            <div className="space-y-4">
              <div className="flex space-x-4">
                <select value={provider} onChange={(e) => setProvider(e.target.value)} className="w-full p-2 border rounded">
                  <option value="gemini">Gemini</option>
                  <option value="claude">Claude</option>
                </select>
                <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full p-2 border rounded">
                  {provider === 'gemini' ? (
                    <>
                      <option value="gemini-pro">Gemini Pro</option>
                    </>
                  ) : (
                    <>
                      <option value="claude-2">Claude 2</option>
                      <option value="claude-instant-1">Claude Instant 1</option>
                    </>
                  )}
                </select>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message"
                className="w-full p-2 border rounded h-32"
              />
              <button onClick={handleSendMessage} disabled={!isConnected || loading} className="w-full px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:bg-gray-400">
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </div>
            {error && <p className="text-red-500 mt-4">{error}</p>}
            {response && (
              <div className="mt-6 p-4 bg-gray-50 rounded">
                <h3 className="font-semibold text-lg mb-2">Response:</h3>
                <pre className="whitespace-pre-wrap">{JSON.stringify(response, null, 2)}</pre>
              </div>
            )}
          </div>
        ) : (
          <button onClick={handleLogin} className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Login with Google</button>
        )}
      </div>
      <footer className="text-center text-gray-500 text-sm mt-4">
        <p>v0.1.0</p>
      </footer>
    </div>
  );
}

export default App;