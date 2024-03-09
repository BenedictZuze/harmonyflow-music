import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import { convertFileSrc } from "@tauri-apps/api/tauri";

import { FaPause, FaPlay } from "react-icons/fa6";

type AudioFile = {
  title: string;
  audio_path: string;
  image_path: string;
};

export default function Playlist() {
  useEffect(() => {
    const loadFiles = async () => {
      await loadFilePaths();
    };
    loadFiles();
  }, []);
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
      <div className="flex gap-3 flex-wrap justify-center h-full overflow-y-auto">
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
                    : "/default2.png"
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
      <div className="flex gap-3 justify-center fixed bottom-0 left-0 right-0 p-3">
        <button className="btn btn-info btn-circle" onClick={pauseTrack}>
          <FaPause />
        </button>
        <button className="btn btn-accent btn-circle" onClick={resumeTrack}>
          <FaPlay />
        </button>
      </div>
    </div>
  );
}
