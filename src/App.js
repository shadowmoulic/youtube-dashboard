import './App.css';

function App() {
  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>YouTube Dashboard</h1>

      <div style={{ marginTop: "30px" }}>
        <h2>Channel Stats</h2>
        <p>Subscribers: 0</p>
        <p>Total Views: 0</p>
        <p>Videos: 0</p>
      </div>

      <div style={{ marginTop: "30px" }}>
        <h2>Latest Video</h2>
        <p>Title: —</p>
        <p>Views: —</p>
        <p>CTR: —</p>
      </div>
    </div>
  );
}

export default App;