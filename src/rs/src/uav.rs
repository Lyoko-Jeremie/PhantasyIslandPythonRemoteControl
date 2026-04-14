use crate::airplane_manager::{get_airplane_manager};
use std::thread;
use std::time::Duration;

pub struct UAV;

impl UAV {
    pub fn new() -> Self {
        {
            let mut airs = get_airplane_manager().lock().unwrap();
            airs.flush();
            airs.start();
            airs.flush();
        }
        UAV
    }

    pub fn sleep(&self, seconds: f64) {
        thread::sleep(Duration::from_secs_f64(seconds));
    }

    pub fn add_uav(&self, port: &str) {
        let mut airs = get_airplane_manager().lock().unwrap();
        airs.get_airplane(port);
    }

    pub fn land(&self, port: &str) {
        let mut airs = get_airplane_manager().lock().unwrap();
        if let Some(p) = airs.get_airplane(port) {
            p.land();
        }
    }

    pub fn emergency(&self, port: &str) {
        let mut airs = get_airplane_manager().lock().unwrap();
        if let Some(p) = airs.get_airplane(port) {
            p.stop();
        }
    }

    pub fn takeoff(&self, port: &str, high: i32) {
        let mut airs = get_airplane_manager().lock().unwrap();
        if let Some(p) = airs.get_airplane(port) {
            p.takeoff(high);
        }
    }

    pub fn up(&self, port: &str, distance: i32) {
        let mut airs = get_airplane_manager().lock().unwrap();
        if let Some(p) = airs.get_airplane(port) {
            p.up(distance);
        }
    }

    pub fn down(&self, port: &str, distance: i32) {
        let mut airs = get_airplane_manager().lock().unwrap();
        if let Some(p) = airs.get_airplane(port) {
            p.down(distance);
        }
    }

    pub fn forward(&self, port: &str, distance: i32) {
        let mut airs = get_airplane_manager().lock().unwrap();
        if let Some(p) = airs.get_airplane(port) {
            p.forward(distance);
        }
    }

    pub fn back(&self, port: &str, distance: i32) {
        let mut airs = get_airplane_manager().lock().unwrap();
        if let Some(p) = airs.get_airplane(port) {
            p.back(distance);
        }
    }

    pub fn left(&self, port: &str, distance: i32) {
        let mut airs = get_airplane_manager().lock().unwrap();
        if let Some(p) = airs.get_airplane(port) {
            p.left(distance);
        }
    }

    pub fn right(&self, port: &str, distance: i32) {
        let mut airs = get_airplane_manager().lock().unwrap();
        if let Some(p) = airs.get_airplane(port) {
            p.right(distance);
        }
    }

    pub fn goto(&self, port: &str, x: i32, y: i32, h: i32) {
        let mut airs = get_airplane_manager().lock().unwrap();
        if let Some(p) = airs.get_airplane(port) {
            p.goto(x, y, h);
        }
    }

    pub fn flip(&self, port: &str, direction: &str) {
        let mut airs = get_airplane_manager().lock().unwrap();
        if let Some(p) = airs.get_airplane(port) {
            p.flip(direction);
        }
    }

    pub fn rotate(&self, port: &str, degree: i32) {
        let mut airs = get_airplane_manager().lock().unwrap();
        if let Some(p) = airs.get_airplane(port) {
            p.rotate(degree);
        }
    }

    pub fn cw(&self, port: &str, degree: i32) {
        let mut airs = get_airplane_manager().lock().unwrap();
        if let Some(p) = airs.get_airplane(port) {
            p.cw(degree);
        }
    }

    pub fn ccw(&self, port: &str, degree: i32) {
        let mut airs = get_airplane_manager().lock().unwrap();
        if let Some(p) = airs.get_airplane(port) {
            p.ccw(degree);
        }
    }

    pub fn speed(&self, port: &str, speed: i32) {
        let mut airs = get_airplane_manager().lock().unwrap();
        if let Some(p) = airs.get_airplane(port) {
            p.speed(speed);
        }
    }

    pub fn high(&self, port: &str, high: i32) {
        let mut airs = get_airplane_manager().lock().unwrap();
        if let Some(p) = airs.get_airplane(port) {
            p.high(high);
        }
    }

    pub fn led(&self, port: &str, r: i32, g: i32, b: i32) {
        let mut airs = get_airplane_manager().lock().unwrap();
        if let Some(p) = airs.get_airplane(port) {
            p.led(r, g, b);
        }
    }

    pub fn bln(&self, port: &str, r: i32, g: i32, b: i32) {
        let mut airs = get_airplane_manager().lock().unwrap();
        if let Some(p) = airs.get_airplane(port) {
            p.bln(r, g, b);
        }
    }

    pub fn rainbow(&self, port: &str, r: i32, g: i32, b: i32) {
        let mut airs = get_airplane_manager().lock().unwrap();
        if let Some(p) = airs.get_airplane(port) {
            p.rainbow(r, g, b);
        }
    }

    pub fn mode(&self, port: &str, mode: i32) {
        let mut airs = get_airplane_manager().lock().unwrap();
        if let Some(p) = airs.get_airplane(port) {
            p.airplane_mode(mode);
        }
    }

    pub fn stop(&self, port: &str) {
        let mut airs = get_airplane_manager().lock().unwrap();
        if let Some(p) = airs.get_airplane(port) {
            p.stop();
        }
    }

    pub fn hover(&self, port: &str) {
        let mut airs = get_airplane_manager().lock().unwrap();
        if let Some(p) = airs.get_airplane(port) {
            p.hover();
        }
    }
}
