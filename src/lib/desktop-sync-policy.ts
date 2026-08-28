export type DesktopSyncDirection='PULL_WEB_TO_DESKTOP'|'PUSH_DESKTOP_TO_WEB'|'BIDIRECTIONAL';
export type DesktopSyncTrigger='MANUAL'|'ON_APP_START'|'INTERVAL';
export type DesktopSyncConflictPolicy='ASK_USER'|'KEEP_WEB'|'KEEP_DESKTOP';
export type DesktopSyncModule='SCHEDULE'|'STUDENTS'|'TEACHERS'|'CLASSES'|'ROOMS'|'RULES'|'SECTIONING'|'CALENDAR';
export type DesktopSyncPolicy={direction:DesktopSyncDirection;trigger:DesktopSyncTrigger;intervalMinutes?:number;modules:DesktopSyncModule[];conflictPolicy:DesktopSyncConflictPolicy};
export type SyncRevision={entityType:string;entityId:string;webRevision:string|null;desktopRevision:string|null;webHash:string|null;desktopHash:string|null};
export type SyncDecision='NOOP'|'PULL'|'PUSH'|'CONFLICT';
export function validateDesktopSyncPolicy(p:DesktopSyncPolicy){if(!p.modules.length)throw new Error('SYNC_MODULES_REQUIRED');if(p.trigger==='INTERVAL'&&(!Number.isFinite(p.intervalMinutes)||Number(p.intervalMinutes)<1))throw new Error('SYNC_INTERVAL_INVALID');return p}
export function decideSync(p:DesktopSyncPolicy,r:SyncRevision):SyncDecision{validateDesktopSyncPolicy(p);if(r.webRevision===r.desktopRevision&&r.webHash===r.desktopHash)return'NOOP';const webChanged=!!r.webRevision&&r.webHash!==r.desktopHash,desktopChanged=!!r.desktopRevision&&r.desktopHash!==r.webHash;if(p.direction==='PULL_WEB_TO_DESKTOP')return webChanged?'PULL':'NOOP';if(p.direction==='PUSH_DESKTOP_TO_WEB')return desktopChanged?'PUSH':'NOOP';if(webChanged&&desktopChanged)return'CONFLICT';if(webChanged)return'PULL';if(desktopChanged)return'PUSH';return'NOOP'}
export const DESKTOP_SYNC_SAFETY={silentOverwrite:false,canonicalServerValidation:true,localOfflineQueue:true,auditRequired:true}as const;
