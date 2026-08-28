use serde::Serialize;

#[derive(Serialize)]
struct DesktopCapabilities {
    logical_cpu_count: usize,
    os: String,
    arch: String,
    cpu_parallel_available: bool,
    gpu_policy: &'static str,
    canonical_objective_authority: &'static str,
}

#[tauri::command]
fn desktop_capabilities() -> DesktopCapabilities {
    let logical_cpu_count = std::thread::available_parallelism().map(|n| n.get()).unwrap_or(1);
    DesktopCapabilities {
        logical_cpu_count,
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        cpu_parallel_available: logical_cpu_count > 1,
        gpu_policy: "WEBVIEW2_WEBGPU_ACCELERATOR_ONLY",
        canonical_objective_authority: "CPU_CANONICAL_SCORER",
    }
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![desktop_capabilities])
        .run(tauri::generate_context!())
        .expect("Okulos Desktop failed to start");
}
