function Home() {
  return (
    <div className="feed">
      <div className="stories">
        <div className="story">You</div>
        <div className="story">Alex</div>
        <div className="story">Emma</div>
        <div className="story">John</div>
      </div>

      <div className="post">
        <div className="post-header">
          <b>virat_kohli</b>
        </div>

        <div className="post-image"></div>

        <div className="post-actions">
          ❤️ 💬 📤
        </div>

        <p><b>12,345 likes</b></p>
        <p>Beautiful day 🔥</p>
      </div>
    </div>
  );
}

export default Home;