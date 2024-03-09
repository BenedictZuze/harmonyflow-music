// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{ path::Path, sync::{ Arc, Mutex }, thread, time::{ Duration, Instant } };
use audio_files::{ find_files_with_images, AudioFile };
use kira::{
    manager::{ backend::DefaultBackend, AudioManager, AudioManagerSettings, MainPlaybackState },
    sound::{ streaming::{ StreamingSoundData, StreamingSoundSettings }, FromFileError, SoundData },
    tween::Tween,
};
use tauri::State;

mod audio_files;
mod audio_player;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn play_audio(
    audio_path: &str,
    state: State<'_, Arc<Mutex<AudioManager>>>,
    sound_state: State<'_, Arc<Mutex<HandleSound>>>
) {
    println!("Audio path: {}", audio_path);
    let path = format!(r#"{}"#, audio_path);
    println!("Songs loaded: {:?}", state.lock().unwrap().num_sounds());
    let manager = Arc::clone(&state);
    let sound_state = Arc::clone(&sound_state);
    // let handle_state = Arc::clone(&sound_state);
    let mut state = sound_state.lock().unwrap();
    if let Some(mut handle) = state.handle.take() {
        println!("Found a handle");
        // Perform operations on handle
        handle.stop(Tween { duration: Duration::from_secs(2), ..Default::default() }).unwrap();
        let sound_state = Arc::clone(&sound_state);
        thread::spawn(move || {
            let now = Instant::now();
            let sound_data = StreamingSoundData::from_file(
                path,
                StreamingSoundSettings::default()
            ).unwrap();
            let elapsed = now.elapsed();
            println!("Loading audio data took: {:.2?}", elapsed);
            let sound_handle = manager.lock().unwrap().play(sound_data).unwrap();
            sound_state.lock().unwrap().handle = Some(sound_handle); // Restore the handle back into the Option
        });
    } else {
        let sound_state = Arc::clone(&sound_state);
        thread::spawn(move || {
            println!("Aint no handle");
            let now = Instant::now();
            let sound_data = StreamingSoundData::from_file(
                path,
                StreamingSoundSettings::default()
            ).unwrap();
            let elapsed = now.elapsed();
            println!("Loading audio data took: {:.2?}", elapsed);
            let sound_handle = manager.lock().unwrap().play(sound_data).unwrap();
            sound_state.lock().unwrap().handle = Some(sound_handle);
        });
    }
}

#[tauri::command]
fn pause_audio(state: State<'_, Arc<Mutex<AudioManager>>>) {
    let manager = state.lock().unwrap();
    match manager.state() {
        MainPlaybackState::Playing => {
            println!("Pausing audio");
            manager
                .pause(Tween { duration: Duration::from_secs(1), ..Default::default() })
                .unwrap();
        }
        _ => { println!("Audio is already paused") }
    }
}

#[tauri::command]
fn resume_audio(state: State<'_, Arc<Mutex<AudioManager>>>) {
    let manager = state.lock().unwrap();
    match manager.state() {
        MainPlaybackState::Paused => {
            println!("Resuming audio");
            manager
                .resume(Tween { duration: Duration::from_secs(1), ..Default::default() })
                .unwrap();
        }
        MainPlaybackState::Pausing => {
            println!("Audio is being paused hold on");
            manager
                .resume(Tween { duration: Duration::from_secs(1), ..Default::default() })
                .unwrap();
        }
        MainPlaybackState::Playing => { println!("Audio is being played") }
    }
}

#[tauri::command]
fn load_file_paths(directory_path: &str) -> Vec<AudioFile> {
    let directory_path = format!(r#"{}"#, directory_path);
    let directory_path = Path::new(&directory_path);
    let file_paths = find_files_with_images(directory_path);
    file_paths
}

struct HandleSound {
    handle: Option<<StreamingSoundData<FromFileError> as SoundData>::Handle>,
}

fn main() {
    let audio_manager = Arc::new(
        Mutex::new(AudioManager::<DefaultBackend>::new(AudioManagerSettings::default()).unwrap())
    );
    // let stream_handle: Option<<StreamingSoundData<FromFileError> as SoundData>::Handle> = None;
    let sound_handle = Arc::new(Mutex::new(HandleSound { handle: None }));
    tauri::Builder
        ::default()
        .manage(audio_manager)
        .manage(sound_handle)
        .invoke_handler(
            tauri::generate_handler![load_file_paths, play_audio, greet, pause_audio, resume_audio]
        )
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
