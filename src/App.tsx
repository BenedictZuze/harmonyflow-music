import "./App.css";
import Playlist from "./Playlist";

function App() {
  return (
    <div className="container">
      <div className="flex justify-center fixed top-0 left-0 right-0 z-10">
        <h1 className=" text-3xl">HarmonyFlow</h1>
      </div>
      <Playlist></Playlist>
    </div>
  );
}

export default App;
