export type CanonicalAccessRole =
  | "system_admin"
  | "institution_admin"
  | "teacher"
  | "student"
  | "guardian";

export type AccessContext = {
  userId: string;
  institutionCode: string | null;
  systemAdmin: boolean;
  institutionAdmin: boolean;
  profileRole: string | null;
  membershipRoles: string[];
};

export class AccessDeniedError extends Error {
  readonly statusCode = 403;
  constructor(message = "Bu işlem için yetkiniz yok.") {
    super(message);
    this.name = "AccessDeniedError";
  }
}

export function canonicalRoles(context: AccessContext): Set<CanonicalAccessRole> {
  const roles = new Set<CanonicalAccessRole>();
  if (context.systemAdmin) roles.add("system_admin");
  if (context.institutionAdmin) roles.add("institution_admin");

  const profileRole = context.profileRole?.toLowerCase();
  const memberships = new Set(context.membershipRoles.map((role) => role.toLowerCase()));

  if (profileRole === "teacher" || memberships.has("teacher")) roles.add("teacher");
  if (profileRole === "student" || memberships.has("student")) roles.add("student");
  if (profileRole === "guardian" || memberships.has("guardian") || memberships.has("parent")) roles.add("guardian");

  return roles;
}

export function assertInstitutionScope(context: AccessContext, institutionCode: string): void {
  if (context.systemAdmin) return;
  if (!context.institutionCode || context.institutionCode !== institutionCode) {
    throw new AccessDeniedError("Başka bir kuruma ait veriye erişemezsiniz.");
  }
}

export function assertAnyRole(context: AccessContext, allowed: CanonicalAccessRole[]): void {
  const current = canonicalRoles(context);
  if (!allowed.some((role) => current.has(role))) throw new AccessDeniedError();
}

export async function loadAccessContext(supabase: any): Promise<AccessContext> {
  const { data, error } = await supabase.rpc("current_access_context");
  if (error) throw error;
  if (!data?.userId) throw new AccessDeniedError("Oturum doğrulanamadı.");
  return {
    userId: String(data.userId),
    institutionCode: data.institutionCode ? String(data.institutionCode) : null,
    systemAdmin: Boolean(data.systemAdmin),
    institutionAdmin: Boolean(data.institutionAdmin),
    profileRole: data.profileRole ? String(data.profileRole) : null,
    membershipRoles: Array.isArray(data.membershipRoles) ? data.membershipRoles.map(String) : [],
  };
}

export async function assertClassAccess(supabase: any, classId: string): Promise<void> {
  const { data, error } = await supabase.rpc("can_access_class", { p_class_id: classId });
  if (error) throw error;
  if (data !== true) throw new AccessDeniedError("Bu sınıfa erişim yetkiniz yok.");
}

export async function assertStudentAccess(supabase: any, studentId: string): Promise<void> {
  const { data, error } = await supabase.rpc("can_access_student", { p_student_id: studentId });
  if (error) throw error;
  if (data !== true) throw new AccessDeniedError("Bu öğrenci kaydına erişim yetkiniz yok.");
}
