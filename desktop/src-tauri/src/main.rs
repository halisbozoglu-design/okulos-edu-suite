mod compute;
mod objective;
mod sync;

use rusqlite::Connection;
use std::fs;
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let data_dir = app.path().app_data_dir()?;
            fs::create_dir_all(&data_dir)?;
            let conn = Connection::open(data_dir.join("okulos-desktop.sqlite3"))?;
            sync::init_db(&conn)?;
            app.manage(sync::DesktopState(std::sync::Mutex::new(conn)));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            compute::desktop_capabilities,
            compute::desktop_compute_plan,
            compute::compare_desktop_objective_vectors,
            sync::desktop_sync_contract,
            sync::save_sync_policy,
            sync::load_sync_policy,
            sync::queue_web_update,
            sync::pending_web_updates,
            sync::mark_web_update_synced,
            sync::store_web_pull,
        ])
        .run(tauri::generate_context!())
        .expect("Okulos Desktop failed to start");
}
