use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DesktopCapabilities {
    pub logical_cpu_count: usize,
    pub os: String,
    pub arch: String,
    pub cpu_parallel_available: bool,
    pub gpu_runtime_probe_required: bool,
    pub gpu_policy: &'static str,
    pub canonical_objective_authority: &'static str,
    pub compiled_constraint_dispatch: bool,
    pub parallel_portfolio: bool,
}

#[derive(Debug, Clone, Copy, Deserialize, Serialize)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
pub enum SolverEffort {
    Fast,
    Balanced,
    Deep,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DesktopComputePlan {
    pub backend: &'static str,
    pub cpu_workers: usize,
    pub gpu_candidate_batching: bool,
    pub gpu_objective_authority: bool,
    pub compiled_constraint_dispatch: bool,
    pub parallel_portfolio: bool,
    pub effort: SolverEffort,
    pub search_policy: &'static str,
}

#[tauri::command]
pub fn desktop_capabilities() -> DesktopCapabilities {
    let logical_cpu_count = std::thread::available_parallelism()
        .map(|n| n.get())
        .unwrap_or(1);
    DesktopCapabilities {
        logical_cpu_count,
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        cpu_parallel_available: logical_cpu_count > 1,
        gpu_runtime_probe_required: true,
        gpu_policy: "WEBVIEW2_WEBGPU_BATCH_ACCELERATOR_WITH_CPU_CANONICAL_FINAL",
        canonical_objective_authority: "CPU_CANONICAL_SCORER",
        compiled_constraint_dispatch: true,
        parallel_portfolio: true,
    }
}

#[tauri::command]
pub fn desktop_compute_plan(effort: SolverEffort, gpu_available: bool) -> DesktopComputePlan {
    let cpus = std::thread::available_parallelism()
        .map(|n| n.get())
        .unwrap_or(1)
        .max(1);
    let reserve = if cpus >= 8 { 2 } else { 1 };
    let cpu_workers = match effort {
        SolverEffort::Fast => cpus.min(2),
        SolverEffort::Balanced => cpus.saturating_sub(reserve).max(1).min(6),
        SolverEffort::Deep => cpus.saturating_sub(reserve).max(1),
    };
    DesktopComputePlan {
        backend: if gpu_available { "CPU_GPU_HYBRID" } else { "CPU_ONLY" },
        cpu_workers,
        gpu_candidate_batching: gpu_available,
        gpu_objective_authority: false,
        compiled_constraint_dispatch: true,
        parallel_portfolio: true,
        effort,
        search_policy: "ASC_INSPIRED_FAIL_FIRST_BACKTRACK_REPAIR_EJECTION_LNS_TABU_SA_VND_PORTFOLIO",
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn gpu_never_becomes_objective_authority() {
        let plan = desktop_compute_plan(SolverEffort::Deep, true);
        assert_eq!(plan.backend, "CPU_GPU_HYBRID");
        assert!(plan.gpu_candidate_batching);
        assert!(!plan.gpu_objective_authority);
    }

    #[test]
    fn cpu_plan_always_has_worker() {
        let plan = desktop_compute_plan(SolverEffort::Fast, false);
        assert!(plan.cpu_workers >= 1);
        assert_eq!(plan.backend, "CPU_ONLY");
    }
}
