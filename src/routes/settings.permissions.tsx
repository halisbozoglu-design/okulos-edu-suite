import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route=createFileRoute("/settings/permissions")({
  head:()=>({meta:[{title:"Görev ve Yetki Atama — OkulOS"}]}),
  component:()=> <Navigate to="/settings-permissions" replace />,
});
