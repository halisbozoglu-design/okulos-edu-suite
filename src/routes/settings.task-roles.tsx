import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route=createFileRoute("/settings/task-roles")({
  head:()=>({meta:[{title:"Görev Şablonları — OkulOS"}]}),
  component:()=> <Navigate to="/settings-task-roles" replace />,
});
