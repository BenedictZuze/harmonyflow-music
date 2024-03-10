import { invoke } from "@tauri-apps/api";
import { useEffect, useState } from "react";
import { convertFileSrc } from "@tauri-apps/api/tauri";

import { FaBackwardFast, FaPause, FaPlay } from "react-icons/fa6";
import { listen } from "@tauri-apps/api/event";
import { FaFastForward } from "react-icons/fa";

type AudioFile = {
  title: string;
  audio_path: string;
  image_path: string;
};

type Position = {
  position: number;
};
export default function Playlist() {
  const [postion, setPosition] = useState<Position>({ position: 0 });
  const [duration, setDuration] = useState<Position>({ position: 100 });

  async function songPosition() {
    await invoke("get_position", {});
    await listen<Position>("positionUpdate", (event) => {
      // console.log(event.payload.position);
      setPosition(event.payload);
    });
  }

  async function songDuration() {
    await listen<Position>("duration", (event) => {
      setDuration(event.payload);
      console.log(event.payload.position);
    });
  }
  useEffect(() => {
    const loadFiles = async () => {
      await loadFilePaths();
    };
    const getPosition = async () => {
      await songPosition();
    };
    const getDuration = async () => {
      await songDuration();
    };
    loadFiles();
    getPosition();
    getDuration();
  }, []);

  const [currentSong, setCurrentSong] = useState<string>("");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  async function playTrack(track: string) {
    console.log(track);
    await invoke("play_audio", { audioPath: track });
    setCurrentSong(track);
    await resumeTrack();
    setIsPlaying(true);
  }

  async function pauseTrack() {
    console.log("Paused");
    await invoke("pause_audio", {});
    setIsPlaying(false);
  }
  async function resumeTrack() {
    console.log("Resume");
    await invoke("resume_audio", {});
    setIsPlaying(true);
  }

  async function nextTrack() {
    console.log("Next");
    for (let index = 0; index < playlist.length; index++) {
      const element = playlist[index];
      if (element.audio_path === currentSong) {
        if (index < playlist.length) {
          const nextSong = playlist[index + 1];
          await playTrack(nextSong.audio_path);
        } else {
          break;
        }
      }
    }
  }

  async function previousTrack() {
    console.log("Prev");
    for (let index = 0; index < playlist.length; index++) {
      const element = playlist[index];
      if (element.audio_path === currentSong) {
        if (index > 1) {
          const prevSong = playlist[index - 1];
          await playTrack(prevSong.audio_path);
        } else {
          break;
        }
      }
    }
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

  const [currentImage, setCurrentImage] = useState<string>("");

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
                    setCurrentImage(audio.image_path);
                  }}
                >
                  Play
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3 justify-center fixed bottom-0 left-0 right-0 p-3 pt-5 backdrop-blur">
        <div className="flex gap-3 items-baseline">
          <img
            src={currentImage ? convertFileSrc(currentImage) : "/default2.png"}
            alt=""
            width={65}
            className=" avatar"
          />
          <p className=" text-xl">{currentSong}</p>
        </div>
        <progress
          className="progress progress-accent w-full"
          value={postion.position}
          max={duration.position}
        ></progress>
        <div className="flex justify-center gap-3">
          <button
            className="btn btn-warning btn-circle"
            onClick={previousTrack}
          >
            <FaBackwardFast />
          </button>
          {isPlaying ? (
            <button className="btn btn-error btn-circle" onClick={pauseTrack}>
              <FaPause />
            </button>
          ) : (
            <button className="btn btn-accent btn-circle" onClick={resumeTrack}>
              <FaPlay />
            </button>
          )}
          <button className="btn btn-secondary btn-circle" onClick={nextTrack}>
            <FaFastForward />
          </button>
        </div>
      </div>
    </div>
  );
}
