import { useState } from "react";
import "./App.css";
import Playlist from "./Playlist";
import { FaMoon, FaSun } from "react-icons/fa6";

function App() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  function toggle() {
    setIsDarkMode(!isDarkMode);
  }
  return (
    <>
      {isDarkMode ? (
        <div className="container bg-gray-900">
          <button
            className="btn btn-circle fixed top-0 left-100 right-5 z-20 m-3 bg-slate-800"
            onClick={toggle}
          >
            <FaMoon />
          </button>
          <div className="flex fixed top-0 left-2 right-0 z-10">
            <img src="/logo.png" alt="logo" width={150} height={150} />
          </div>
          <Playlist></Playlist>
        </div>
      ) : (
        <div className="container bg-slate-300">
          <button
            className="btn btn-circle fixed top-0 left-100 right-5 z-20 m-3 bg-black"
            onClick={toggle}
          >
            <FaSun />
          </button>
          <div className="flex fixed top-0 left-2 right-0 z-10">
            <img src="/logo.png" alt="logo" width={150} height={150} />
          </div>
          <Playlist></Playlist>
        </div>
      )}
    </>
  );
}

export default App;
