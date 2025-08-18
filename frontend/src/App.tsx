
import { useState, useEffect } from 'react';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import './App.css';

const API_URL = 'https://us-central1-thoughtless-v2.cloudfunctions.net/api';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [isConnected, setIsConnected] = useState(false);

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
    const token = await user.getIdToken();
    const res = await fetch(`${API_URL}/chatbots/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ model: 'gemini-pro', message }),
    });
    const data = await res.json();
    setResponse(JSON.stringify(data, null, 2));
  };

  return (
    <div className="App">
      <header className="App-header">
        {user ? (
          <div>
            <p>Welcome, {user.displayName}</p>
            {!isConnected ? (
                <button onClick={handleConnect}>Connect to Gemini</button>
            ) : (
                <p>Connected to Gemini</p>
            )}
            <div>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message"
              />
              <button onClick={handleSendMessage} disabled={!isConnected}>Send Message</button>
            </div>
            {response && <pre>{response}</pre>}
          </div>
        ) : (
          <button onClick={handleLogin}>Login with Google</button>
        )}
      </header>
    </div>
  );
}

export default App;
