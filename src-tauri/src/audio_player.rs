use std::sync::{ Arc, Mutex };

use rodio::{ self, Sink };

#[derive(Default)]
pub struct AudioPlayer {
    pub sink: Option<Arc<Mutex<Sink>>>,
}
