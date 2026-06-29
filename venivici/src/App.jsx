import React, { useState, useEffect } from 'react';
import './App.css';

const CAT_NAMES = [
  "Yoongi", "Oliver", "Jack", "Milo", "Luna", "Simba",
  "Chloe", "Bella", "Garfield", "Felix", "Biscuit", "Mochi"
];

export default function App() {
  const [currentCat, setCurrentCat] = useState(null);
  const [history, setHistory] = useState([]);
  const [banList, setBanList] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRandomCat = async (activeBans = banList) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://api.thecatapi.com/v1/breeds');
      if (!response.ok) throw new Error("Could not contact the Cat database.");

      const breeds = await response.json();

      const allowedBreeds = breeds.filter(breed => {
        const weightStr = `${breed.weight?.imperial} lbs`;
        const lifeSpanStr = `${breed.life_span} years`;

        return !activeBans.has(breed.name) &&
            !activeBans.has(weightStr) &&
            !activeBans.has(breed.origin) &&
            !activeBans.has(lifeSpanStr);
      });

      if (allowedBreeds.length === 0) {
        setError("All loaded combinations match your ban list rules! Try clearing a ban.");
        setCurrentCat(null);
        setLoading(false);
        return;
      }

      const randomBreed = allowedBreeds[Math.floor(Math.random() * allowedBreeds.length)];

      const imageUrl = randomBreed.reference_image_id
          ? `https://cdn2.thecatapi.com/images/${randomBreed.reference_image_id}.jpg`
          : 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=500';

      const randomName = CAT_NAMES[Math.floor(Math.random() * CAT_NAMES.length)];

      const newCat = {
        id: randomBreed.id,
        name: randomName,
        breed: randomBreed.name,
        weight: `${randomBreed.weight?.imperial} lbs`,
        origin: randomBreed.origin,
        lifeSpan: `${randomBreed.life_span} years`,
        url: imageUrl
      };

      if (currentCat) {
        setHistory(prev => [currentCat, ...prev]);
      }

      setCurrentCat(newCat);
    } catch (err) {
      console.error(err);
      setError("Network error. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomCat();
  }, []);

  const handleToggleBan = (attribute) => {
    setBanList(prev => {
      const updatedBans = new Set(prev);

      if (updatedBans.has(attribute)) {
        updatedBans.delete(attribute);
      } else {
        updatedBans.add(attribute);

        if (currentCat && (
            currentCat.breed === attribute ||
            currentCat.weight === attribute ||
            currentCat.origin === attribute ||
            currentCat.lifeSpan === attribute
        )) {
          fetchRandomCat(updatedBans);
        }
      }
      return updatedBans;
    });
  };

  return (
      <div className="app-container">
        {/* LEFT SIDEBAR: History Panel */}
        <aside className="sidebar left-sidebar">
          <h3>Who have we seen so far?</h3>
          <div className="history-list">
            {history.length === 0 ? (
                <p className="empty-text">No cats discovered yet.</p>
            ) : (
                history.map((cat, index) => (
                    <div key={`${cat.id}-${index}`} className="history-item">
                      <img
                          src={cat.url}
                          alt={cat.breed}
                          className="history-thumb"
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=100' }}
                      />
                      <p>A {cat.breed} cat from {cat.origin}</p>
                    </div>
                ))
            )}
          </div>
        </aside>

        {/* MAIN CONTENT WORKSPACE */}
        <main className="main-content">
          <header className="hero-section">
            <h1>Veni Vici!</h1>
            <p className="hero-subtitle">Discover cats from your wildest dreams!</p>
            <div className="emoji-row">😹😻😼😽😸🙀😾</div>
          </header>

          <section className="display-card">
            {error ? (
                <p className="error-message">{error}</p>
            ) : loading ? (
                <div className="loader-container">
                  <div className="spinner"></div>
                  <p>Finding next safe match...</p>
                </div>
            ) : currentCat ? (
                <>
                  <h2 className="cat-name">{currentCat.name}</h2>

                  <div className="attribute-container">
                    <button onClick={() => handleToggleBan(currentCat.breed)} className="attr-tag">
                      {currentCat.breed}
                    </button>
                    <button onClick={() => handleToggleBan(currentCat.weight)} className="attr-tag">
                      {currentCat.weight}
                    </button>
                    <button onClick={() => handleToggleBan(currentCat.origin)} className="attr-tag">
                      {currentCat.origin}
                    </button>
                    <button onClick={() => handleToggleBan(currentCat.lifeSpan)} className="attr-tag">
                      {currentCat.lifeSpan}
                    </button>
                  </div>

                  <div className="image-frame">
                    <img
                        src={currentCat.url}
                        alt="Current Discovered Cat"
                        className="main-cat-img"
                        onError={(e) => {
                          e.target.src = "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?q=80&w=500";
                        }}
                    />
                  </div>
                </>
            ) : (
                <p className="empty-text">No cat matches found.</p>
            )}

            <button onClick={() => fetchRandomCat(banList)} className="discover-btn" disabled={loading}>
              🔀 Discover!
            </button>
          </section>
        </main>

        {/* RIGHT SIDEBAR: Ban List Panel */}
        <aside className="sidebar right-sidebar">
          <h3>Ban List</h3>
          <p className="subtitle">Select an attribute in your listing to ban it</p>
          <div className="ban-list">
            {banList.size === 0 ? (
                <p className="empty-text">No banned attributes yet.</p>
            ) : (
                Array.from(banList).map((bannedAttr) => (
                    <button
                        key={bannedAttr}
                        className="ban-tag"
                        onClick={() => handleToggleBan(bannedAttr)}
                    >
                      {bannedAttr}
                    </button>
                ))
            )}
          </div>
        </aside>
      </div>
  );
}
