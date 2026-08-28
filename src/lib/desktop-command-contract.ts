import type{DesktopSyncModule,DesktopSyncPolicy}from'./desktop-sync-policy';
export type DesktopCommand='UPDATE_WEB'|'PULL_DATA'|'SYNC'|'SHOW_CONFLICTS';
export type DesktopCommandRequest={command:DesktopCommand;modules:DesktopSyncModule[];policy?:DesktopSyncPolicy;requestedByUser:true};
export type DesktopCommandEffect='PUSH_LOCAL_CHANGES'|'PULL_REMOTE_CHANGES'|'RUN_POLICY_SYNC'|'READ_CONFLICTS_ONLY';
export function resolveDesktopCommand(r:DesktopCommandRequest):DesktopCommandEffect{if(!r.requestedByUser)throw new Error('EXPLICIT_USER_COMMAND_REQUIRED');if(!r.modules.length)throw new Error('DESKTOP_COMMAND_MODULES_REQUIRED');switch(r.command){case'UPDATE_WEB':return'PUSH_LOCAL_CHANGES';case'PULL_DATA':return'PULL_REMOTE_CHANGES';case'SYNC':if(!r.policy)throw new Error('SYNC_POLICY_REQUIRED');return'RUN_POLICY_SYNC';case'SHOW_CONFLICTS':return'READ_CONFLICTS_ONLY'}}
export const DESKTOP_DATA_ARCHITECTURE={localStore:'SQLITE',remoteStore:'LOVABLE_CLOUD',offlineFirst:true,outbox:true,inbox:true,revisionHashConflictDetection:true,canonicalServerValidationOnPush:true}as const;
