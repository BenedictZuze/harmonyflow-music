import { invoke } from "@tauri-apps/api";
import { useState } from "react";
import { convertFileSrc } from "@tauri-apps/api/tauri";

type AudioFile = {
  title: string;
  audio_path: string;
  image_path: string;
};

export default function Playlist() {
  async function playTrack(track: string) {
    console.log(track);
    await invoke("play_audio", { audioPath: track });
  }
  async function pauseTrack() {
    console.log("Paused");
    await invoke("pause_audio", {});
  }
  async function resumeTrack() {
    console.log("Resume");
    await invoke("resume_audio", {});
  }

  const [playlist, setPlaylist] = useState<AudioFile[]>([]);
  const directoryPath = "D:\\Music";
  async function loadFilePaths() {
    try {
      const files = await invoke<AudioFile[]>("load_file_paths", {
        directoryPath,
      });
      setPlaylist(files);
    } catch (error) {
      console.error("Error receiving files from Rust:", error);
    }
  }

  return (
    <div>
      <h1>Playlist</h1>
      <button className="btn btn-primary" onClick={loadFilePaths}>
        Add Playlist
      </button>
      <button className="btn btn-info" onClick={pauseTrack}>
        Pause
      </button>
      <button className="btn btn-accent" onClick={resumeTrack}>
        Resume
      </button>
      <div className="flex gap-3 flex-wrap justify-center">
        {playlist.map((audio, index) => (
          <div
            className="card card-compact w-96 bg-base-100 shadow-xl"
            key={index}
          >
            <figure>
              <img
                src={
                  audio.image_path
                    ? convertFileSrc(audio.image_path)
                    : "/vite.svg"
                }
                alt="Cover"
                width={250}
                height={250}
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title">{audio.title}</h2>
              <div className="card-actions justify-end">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    playTrack(audio.audio_path);
                  }}
                >
                  Play
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
