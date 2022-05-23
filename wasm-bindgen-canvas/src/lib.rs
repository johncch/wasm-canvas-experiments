mod utils;

use wasm_bindgen::prelude::*;
use wasm_bindgen::Clamped;
use wasm_bindgen::JsCast;
use web_sys::console;
use web_sys::HtmlCanvasElement;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, wasm-bindgen!");
}

#[wasm_bindgen]
pub struct WasmRenderer {
    frame: u32,
    width: u32,
    height: u32,
    context: web_sys::CanvasRenderingContext2d,
    image_data: web_sys::ImageData,
}

#[wasm_bindgen]
impl WasmRenderer {
    pub fn new(canvas_id: String, width: u32, height: u32) -> WasmRenderer {
        let document = web_sys::window().unwrap().document().unwrap();
        let canvas = document.get_element_by_id(&canvas_id).unwrap();
        let canvas: HtmlCanvasElement = canvas
            .dyn_into::<HtmlCanvasElement>()
            .map_err(|_| ())
            .unwrap();

        let context = canvas
            .get_context("2d")
            .unwrap()
            .unwrap()
            .dyn_into::<web_sys::CanvasRenderingContext2d>()
            .unwrap();

        let vector: Vec<u8> = (0..width * height * 4)
            .map(|i| if i % 4 == 1 { 0x00 } else { 0xFF })
            .collect();

        let clamped_buf: Clamped<&[u8]> = Clamped(vector.as_slice());
        let image_data =
            web_sys::ImageData::new_with_u8_clamped_array_and_sh(clamped_buf, width, height)
                .unwrap();

        WasmRenderer {
            frame: 0,
            width,
            height,
            context,
            image_data: image_data,
        }
    }
    pub fn width(&self) -> u32 {
        self.width
    }
    // pub fn set_width(&mut self, width: u32) {
    //     self.width = width;
    // }
    pub fn height(&self) -> u32 {
        self.height
    }
    // pub fn set_height(&mut self, height: u32) {
    //     self.height = height
    // }
    pub fn render(&mut self) {
        let mut buffer = self.image_data.data();

        self.frame += 1;
        for y in 1..self.height {
            for x in 1..self.width {
                let res = self.frame + (x ^ y);
                let base_ind = y * self.width * 4 + x * 4;
                let base_ind = usize::try_from(base_ind).unwrap();
                buffer[base_ind] = (res & 0xFF) as u8;
                buffer[base_ind + 1] = (res << 8 & 0xff) as u8;
                buffer[base_ind + 2] = (res << 16 & 0xff) as u8;
                buffer[base_ind + 3] = 0xFF;
            }
        }

        self.context.put_image_data(&self.image_data, 0.0, 0.0);
    }
    pub fn test(&self) {
        utils::set_panic_hook();
        console::log_1(&"Test successful!".into())
    }
}
