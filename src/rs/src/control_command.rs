use crate::airplane_core::AirplaneCore;
use crate::http_layer::{send_cmd, send_cmd_volatile};
use serde_json::Value;

pub struct AirplaneController {
    pub core: AirplaneCore,
    pub count: i32,
    pub fast_mode: bool,
}

impl AirplaneController {
    pub fn new(
        key_name: String,
        type_name: String,
        update_timestamp: i64,
        status: crate::airplane_core::AirplaneFlyStatus,
        camera_front: String,
        camera_down: String,
    ) -> Self {
        Self {
            core: AirplaneCore::new(
                key_name,
                type_name,
                update_timestamp,
                status,
                camera_front,
                camera_down,
            ),
            count: 1,
            fast_mode: false,
        }
    }

    pub fn use_fast_mode(&mut self, fast_mode: bool) {
        self.fast_mode = fast_mode;
    }

    fn next_count(&mut self) -> i32 {
        self.count += 2;
        self.count
    }

    fn prepare_command(&mut self, command: &str) -> String {
        let count = self.next_count();
        format!("{} {} {}", self.core.key_name, count, command)
    }

    fn send_cmd(&mut self, command: &str) -> Value {
        let full_cmd = self.prepare_command(command);
        if self.fast_mode {
            send_cmd_volatile(&full_cmd)
        } else {
            send_cmd(&full_cmd)
        }
    }

    pub fn mode(&mut self, mode: i32) -> Value {
        self.airplane_mode(mode)
    }

    pub fn takeoff(&mut self, high: i32) -> Value {
        self.send_cmd(&format!("takeoff {}", high))
    }

    pub fn land(&mut self) -> Value {
        self.send_cmd("land")
    }

    pub fn emergency(&mut self) -> Value {
        self.send_cmd("emergency")
    }

    pub fn up(&mut self, distance: i32) -> Value {
        self.send_cmd(&format!("up {}", distance))
    }

    pub fn down(&mut self, distance: i32) -> Value {
        self.send_cmd(&format!("down {}", distance))
    }

    pub fn forward(&mut self, distance: i32) -> Value {
        self.send_cmd(&format!("forward {}", distance))
    }

    pub fn back(&mut self, distance: i32) -> Value {
        self.send_cmd(&format!("back {}", distance))
    }

    pub fn left(&mut self, distance: i32) -> Value {
        self.send_cmd(&format!("left {}", distance))
    }

    pub fn right(&mut self, distance: i32) -> Value {
        self.send_cmd(&format!("right {}", distance))
    }

    pub fn goto(&mut self, x: i32, y: i32, h: i32) -> Value {
        self.send_cmd(&format!("goto {} {} {}", x, y, h))
    }

    pub fn flip(&mut self, direction: &str) -> Value {
        self.send_cmd(&format!("flip {} 1", direction))
    }

    pub fn rotate(&mut self, degree: i32) -> Value {
        self.send_cmd(&format!("rotate {}", degree))
    }

    pub fn cw(&mut self, degree: i32) -> Value {
        self.send_cmd(&format!("cw {}", degree))
    }

    pub fn ccw(&mut self, degree: i32) -> Value {
        self.send_cmd(&format!("ccw {}", degree))
    }

    pub fn high(&mut self, high: i32) -> Value {
        self.send_cmd(&format!("high {}", high))
    }

    pub fn speed(&mut self, speed: i32) -> Value {
        self.send_cmd(&format!("setSpeed {}", speed))
    }

    pub fn led(&mut self, r: i32, g: i32, b: i32) -> Value {
        self.send_cmd(&format!("light {} {} {}", r, g, b))
    }

    pub fn bln(&mut self, r: i32, g: i32, b: i32) -> Value {
        self.send_cmd(&format!("bln {} {} {}", r, g, b))
    }

    pub fn rainbow(&mut self, r: i32, g: i32, b: i32) -> Value {
        self.send_cmd(&format!("rainbow {} {} {}", r, g, b))
    }

    pub fn airplane_mode(&mut self, mode: i32) -> Value {
        self.send_cmd(&format!("airplane_mode {}", mode))
    }

    pub fn hover(&mut self) -> Value {
        self.send_cmd("hover")
    }

    pub fn stop(&mut self) -> Value {
        self.hover()
    }
}
