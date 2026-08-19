import { existsSync, readFileSync } from 'node:fs';

const required=[
 'supabase/migrations/20260819074400_schedule_advanced_optimization_model.sql',
 'supabase/migrations/20260819074500_schedule_advanced_optimization_engine.sql',
 'supabase/migrations/20260819074600_schedule_advanced_block_count_and_repair_audit.sql',
 'supabase/migrations/20260819074700_schedule_workshop_exemption_and_defaults.sql',
 'supabase/migrations/20260819074800_schedule_rule_mode_completion.sql',
 'supabase/migrations/20260819074900_schedule_soft_local_search_optimizer.sql',
 'supabase/migrations/20260819075000_schedule_advanced_publish_integrity.sql',
 'src/routes/schedule-optimization.tsx',
];
const errors=[];
for(const f of required) if(!existsSync(f)) errors.push(`eksik dosya: ${f}`);
if(!errors.length){
 const model=readFileSync(required[0],'utf8');
 for(const token of ['schedule_optimization_profiles','schedule_rule_modes','course_pedagogy_profiles','schedule_workshop_policies','schedule_duty_optimization','schedule_repair_audit','schedule_scenario_explanations']) if(!model.includes(token)) errors.push(`model eksik: ${token}`);
 const engine=readFileSync(required[1],'utf8');
 for(const token of ['apply_schedule_optimization_profile_v1','get_schedule_scenario_quality_breakdown_v1','get_schedule_scenario_advanced_hard_issues_v1','refresh_schedule_scenario_explanation_v1']) if(!engine.includes(token)) errors.push(`engine eksik: ${token}`);
 const audit=readFileSync(required[2],'utf8');
 for(const token of ['repair_schedule_scenario_permission_core_v2','schedule_repair_audit','score_delta','hard_issues_before','hard_issues_after']) if(!audit.includes(token)) errors.push(`repair audit eksik: ${token}`);
 const exempt=readFileSync(required[3],'utf8');
 for(const token of ['is_workshop','is_vocational_practice','seed_course_pedagogy_defaults_v1']) if(!exempt.includes(token)) errors.push(`workshop/pedagogy guard eksik: ${token}`);
 const modes=readFileSync(required[4],'utf8');
 for(const token of ['course_time_preference','DUTY_ADJACENT_LESSON','HEAVY_COURSE_CONSECUTIVE','PEDAGOGIC_DAILY_IMBALANCE','WORKSHOP_PREFERRED_BLOCK']) if(!modes.includes(token)) errors.push(`hard/soft completion eksik: ${token}`);
 const local=readFileSync(required[5],'utf8');
 for(const token of ['improve_schedule_scenario_soft_v1','soft_local_search','SOFT_LOCAL_SEARCH']) if(!local.includes(token)) errors.push(`local search eksik: ${token}`);
 const publish=readFileSync(required[6],'utf8');
 for(const token of ['get_schedule_advanced_integrity_issues_v1','get_schedule_integrity_report_pre_advanced_v3','COURSE_TIME_PREFERENCE']) if(!publish.includes(token)) errors.push(`publish integrity eksik: ${token}`);
 const ui=readFileSync(required[7],'utf8');
 for(const token of ['Program Optimizasyonu','Hard/Soft','Nöbet ↔ Ders Programı','Açıklanabilir Senaryo Karşılaştırması','Repair / Backtracking Geçmişi']) if(!ui.includes(token)) errors.push(`optimizasyon UI eksik: ${token}`);
}
if(errors.length){console.error('Advanced optimization check FAILED:\n'+errors.map(x=>`- ${x}`).join('\n'));process.exit(1)}
console.log('Advanced optimization check OK.');
