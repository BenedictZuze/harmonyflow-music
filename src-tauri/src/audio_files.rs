use std::path::{ Path, PathBuf };
use serde::{ Deserialize, Serialize };
use walkdir::WalkDir;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AudioFile {
    title: String,
    audio_path: PathBuf,
    image_path: Option<PathBuf>,
}

impl AudioFile {
    fn new(title: String, audio_path: PathBuf, image_path: Option<PathBuf>) -> Self {
        AudioFile { title, audio_path, image_path }
    }
}

pub fn find_files_with_images(directory_path: &Path) -> Vec<AudioFile> {
    let mut files_with_images: Vec<AudioFile> = Vec::new();

    for entry in WalkDir::new(directory_path).follow_links(true) {
        if let Ok(entry) = entry {
            if entry.file_type().is_file() {
                // Check if the file has one of the specified extensions
                if let Some(file_name) = entry.file_name().to_str() {
                    if
                        file_name.ends_with(".mp3") ||
                        file_name.ends_with(".flac") ||
                        file_name.ends_with(".wav") ||
                        file_name.ends_with(".ogg")
                    {
                        // Record the path of the file
                        let title = entry.file_name().to_string_lossy().into_owned();
                        let audio_path = entry.path().to_path_buf();
                        let image_path = find_images_in_directory(entry.path().parent().unwrap());
                        let audio_file = AudioFile::new(title, audio_path, image_path);
                        files_with_images.push(audio_file);
                    }
                }
            }
        }
    }
    files_with_images
}

fn find_images_in_directory(directory_path: &Path) -> Option<PathBuf> {
    for entry in WalkDir::new(directory_path).follow_links(true) {
        if let Ok(entry) = entry {
            if entry.file_type().is_file() {
                // Check if file has on of the specified extensions
                if let Some(file_name) = entry.file_name().to_str() {
                    if file_name.ends_with(".png") || file_name.ends_with(".jpg") {
                        // Return the path of the file
                        return Some(entry.path().to_path_buf());
                    }
                }
            }
        }
    }
    None
}
