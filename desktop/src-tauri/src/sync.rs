use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use tauri::State;

pub struct DesktopState(pub Mutex<Connection>);

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum SyncDirection {
    PullWebToDesktop,
    PushDesktopToWeb,
    Bidirectional,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum SyncTrigger {
    Manual,
    OnAppStart,
    Interval,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum ConflictPolicy {
    AskUser,
    KeepWeb,
    KeepDesktop,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SyncPolicy {
    pub direction: SyncDirection,
    pub trigger: SyncTrigger,
    pub interval_minutes: Option<u32>,
    pub modules: Vec<String>,
    pub conflict_policy: ConflictPolicy,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SyncEnvelope {
    pub id: i64,
    pub user_key: String,
    pub institution_key: String,
    pub module: String,
    pub entity_type: String,
    pub entity_id: String,
    pub revision: Option<String>,
    pub content_hash: Option<String>,
    pub payload_json: String,
    pub state: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SyncContract {
    pub local_store: &'static str,
    pub remote_store: &'static str,
    pub web_session_is_authority: bool,
    pub service_role_secret_in_desktop: bool,
    pub offline_outbox: bool,
    pub inbox_mirror: bool,
    pub canonical_server_validation_on_push: bool,
    pub silent_overwrite: bool,
}

pub fn init_db(conn: &Connection) -> rusqlite::Result<()> {
    conn.execute_batch(
        "PRAGMA journal_mode=WAL;
         CREATE TABLE IF NOT EXISTS sync_policy(
           user_key TEXT NOT NULL,
           institution_key TEXT NOT NULL,
           policy_json TEXT NOT NULL,
           updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
           PRIMARY KEY(user_key,institution_key)
         );
         CREATE TABLE IF NOT EXISTS sync_outbox(
           id INTEGER PRIMARY KEY AUTOINCREMENT,
           user_key TEXT NOT NULL,
           institution_key TEXT NOT NULL,
           module TEXT NOT NULL,
           entity_type TEXT NOT NULL,
           entity_id TEXT NOT NULL,
           revision TEXT,
           content_hash TEXT,
           payload_json TEXT NOT NULL,
           state TEXT NOT NULL DEFAULT 'PENDING',
           created_at INTEGER NOT NULL DEFAULT (unixepoch()),
           updated_at INTEGER NOT NULL DEFAULT (unixepoch())
         );
         CREATE INDEX IF NOT EXISTS sync_outbox_pending_idx ON sync_outbox(user_key,institution_key,state,id);
         CREATE TABLE IF NOT EXISTS sync_mirror(
           user_key TEXT NOT NULL,
           institution_key TEXT NOT NULL,
           module TEXT NOT NULL,
           entity_type TEXT NOT NULL,
           entity_id TEXT NOT NULL,
           revision TEXT,
           content_hash TEXT,
           payload_json TEXT NOT NULL,
           updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
           PRIMARY KEY(user_key,institution_key,module,entity_type,entity_id)
         );"
    )
}

fn validate_policy(policy: &SyncPolicy) -> Result<(), String> {
    if policy.modules.is_empty() {
        return Err("SYNC_MODULES_REQUIRED".into());
    }
    if matches!(policy.trigger, SyncTrigger::Interval) && policy.interval_minutes.unwrap_or(0) < 1 {
        return Err("SYNC_INTERVAL_INVALID".into());
    }
    Ok(())
}

#[tauri::command]
pub fn desktop_sync_contract() -> SyncContract {
    SyncContract {
        local_store: "SQLITE",
        remote_store: "LOVABLE_CLOUD",
        web_session_is_authority: true,
        service_role_secret_in_desktop: false,
        offline_outbox: true,
        inbox_mirror: true,
        canonical_server_validation_on_push: true,
        silent_overwrite: false,
    }
}

#[tauri::command]
pub fn save_sync_policy(
    state: State<'_, DesktopState>,
    user_key: String,
    institution_key: String,
    policy: SyncPolicy,
) -> Result<(), String> {
    validate_policy(&policy)?;
    let json = serde_json::to_string(&policy).map_err(|e| e.to_string())?;
    let conn = state.0.lock().map_err(|_| "DESKTOP_DB_LOCK_POISONED".to_string())?;
    conn.execute(
        "INSERT INTO sync_policy(user_key,institution_key,policy_json,updated_at) VALUES(?1,?2,?3,unixepoch())
         ON CONFLICT(user_key,institution_key) DO UPDATE SET policy_json=excluded.policy_json,updated_at=unixepoch()",
        params![user_key, institution_key, json],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn load_sync_policy(
    state: State<'_, DesktopState>,
    user_key: String,
    institution_key: String,
) -> Result<Option<SyncPolicy>, String> {
    let conn = state.0.lock().map_err(|_| "DESKTOP_DB_LOCK_POISONED".to_string())?;
    let mut stmt = conn.prepare("SELECT policy_json FROM sync_policy WHERE user_key=?1 AND institution_key=?2").map_err(|e| e.to_string())?;
    let mut rows = stmt.query(params![user_key, institution_key]).map_err(|e| e.to_string())?;
    let Some(row) = rows.next().map_err(|e| e.to_string())? else { return Ok(None) };
    let json: String = row.get(0).map_err(|e| e.to_string())?;
    serde_json::from_str(&json).map(Some).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn queue_web_update(
    state: State<'_, DesktopState>,
    user_key: String,
    institution_key: String,
    module: String,
    entity_type: String,
    entity_id: String,
    revision: Option<String>,
    content_hash: Option<String>,
    payload_json: String,
) -> Result<i64, String> {
    if module.trim().is_empty() || entity_type.trim().is_empty() || entity_id.trim().is_empty() {
        return Err("SYNC_ENVELOPE_KEYS_REQUIRED".into());
    }
    serde_json::from_str::<serde_json::Value>(&payload_json).map_err(|_| "SYNC_PAYLOAD_JSON_INVALID".to_string())?;
    let conn = state.0.lock().map_err(|_| "DESKTOP_DB_LOCK_POISONED".to_string())?;
    conn.execute(
        "INSERT INTO sync_outbox(user_key,institution_key,module,entity_type,entity_id,revision,content_hash,payload_json,state)
         VALUES(?1,?2,?3,?4,?5,?6,?7,?8,'PENDING')",
        params![user_key,institution_key,module,entity_type,entity_id,revision,content_hash,payload_json],
    ).map_err(|e| e.to_string())?;
    Ok(conn.last_insert_rowid())
}

#[tauri::command]
pub fn pending_web_updates(
    state: State<'_, DesktopState>,
    user_key: String,
    institution_key: String,
    limit: Option<u32>,
) -> Result<Vec<SyncEnvelope>, String> {
    let conn = state.0.lock().map_err(|_| "DESKTOP_DB_LOCK_POISONED".to_string())?;
    let mut stmt = conn.prepare(
        "SELECT id,user_key,institution_key,module,entity_type,entity_id,revision,content_hash,payload_json,state
         FROM sync_outbox WHERE user_key=?1 AND institution_key=?2 AND state='PENDING' ORDER BY id LIMIT ?3"
    ).map_err(|e| e.to_string())?;
    let mapped = stmt.query_map(params![user_key,institution_key,limit.unwrap_or(200).clamp(1,1000)], |r| Ok(SyncEnvelope {
        id:r.get(0)?, user_key:r.get(1)?, institution_key:r.get(2)?, module:r.get(3)?, entity_type:r.get(4)?, entity_id:r.get(5)?,
        revision:r.get(6)?, content_hash:r.get(7)?, payload_json:r.get(8)?, state:r.get(9)?
    })).map_err(|e| e.to_string())?;
    mapped.collect::<rusqlite::Result<Vec<_>>>().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn mark_web_update_synced(state: State<'_, DesktopState>, id: i64) -> Result<(), String> {
    let conn = state.0.lock().map_err(|_| "DESKTOP_DB_LOCK_POISONED".to_string())?;
    let n = conn.execute("UPDATE sync_outbox SET state='SYNCED',updated_at=unixepoch() WHERE id=?1 AND state='PENDING'", params![id]).map_err(|e| e.to_string())?;
    if n != 1 { return Err("SYNC_OUTBOX_ITEM_NOT_PENDING".into()); }
    Ok(())
}

#[tauri::command]
pub fn store_web_pull(
    state: State<'_, DesktopState>,
    user_key: String,
    institution_key: String,
    module: String,
    entity_type: String,
    entity_id: String,
    revision: Option<String>,
    content_hash: Option<String>,
    payload_json: String,
) -> Result<(), String> {
    serde_json::from_str::<serde_json::Value>(&payload_json).map_err(|_| "SYNC_PAYLOAD_JSON_INVALID".to_string())?;
    let conn = state.0.lock().map_err(|_| "DESKTOP_DB_LOCK_POISONED".to_string())?;
    conn.execute(
        "INSERT INTO sync_mirror(user_key,institution_key,module,entity_type,entity_id,revision,content_hash,payload_json,updated_at)
         VALUES(?1,?2,?3,?4,?5,?6,?7,?8,unixepoch())
         ON CONFLICT(user_key,institution_key,module,entity_type,entity_id) DO UPDATE SET revision=excluded.revision,content_hash=excluded.content_hash,payload_json=excluded.payload_json,updated_at=unixepoch()",
        params![user_key,institution_key,module,entity_type,entity_id,revision,content_hash,payload_json],
    ).map_err(|e| e.to_string())?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn schema_and_policy_are_offline_first_and_user_scoped() {
        let conn = Connection::open_in_memory().unwrap();
        init_db(&conn).unwrap();
        let policy = SyncPolicy { direction:SyncDirection::Bidirectional, trigger:SyncTrigger::Manual, interval_minutes:None, modules:vec!["SCHEDULE".into()], conflict_policy:ConflictPolicy::AskUser };
        validate_policy(&policy).unwrap();
        conn.execute("INSERT INTO sync_policy(user_key,institution_key,policy_json) VALUES('u','i',?1)", params![serde_json::to_string(&policy).unwrap()]).unwrap();
        let count:i64=conn.query_row("SELECT count(*) FROM sync_policy WHERE user_key='u' AND institution_key='i'", [], |r| r.get(0)).unwrap();
        assert_eq!(count,1);
    }

    #[test]
    fn interval_requires_positive_minutes() {
        let policy = SyncPolicy { direction:SyncDirection::PullWebToDesktop, trigger:SyncTrigger::Interval, interval_minutes:Some(0), modules:vec!["SCHEDULE".into()], conflict_policy:ConflictPolicy::AskUser };
        assert_eq!(validate_policy(&policy).unwrap_err(), "SYNC_INTERVAL_INVALID");
    }
}
