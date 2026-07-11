import React, { useState } from 'react';
import Profile from './pages/Profile';
import Explore from './pages/Explore';

function App() {
  const [view, setView] = useState('profile');

  return (
    <div>
      <nav className="navbar">
        <div className="nav-container">
          <h1 className="nav-brand">Instagram</h1>
          <div className="nav-buttons">
            <button 
              onClick={() => setView('explore')} 
              className={`nav-btn ${view === 'explore' ? 'active' : ''}`}
            >
              Explore
            </button>
            <button 
              onClick={() => setView('profile')} 
              className={`nav-btn ${view === 'profile' ? 'active' : ''}`}
            >
              Profile
            </button>
          </div>
        </div>
      </nav>

      <main>
        {view === 'profile' ? <Profile /> : <Explore />}
      </main>
    </div>
  );
}

export default App;