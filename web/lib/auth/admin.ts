type UserWithEmail = {
  email?: string | null;
};

function parseAdminEmails(rawValue: string | undefined) {
  if (!rawValue) return [];
  return rawValue
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}

export function getAdminEmails() {
  return parseAdminEmails(process.env.ADMIN_EMAILS);
}

export function isAdminEmail(email: string | null | undefined) {
  if (!email) return false;
  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) return false;
  return adminEmails.includes(email.trim().toLowerCase());
}

export function isAdminUser(user: UserWithEmail | null | undefined) {
  return isAdminEmail(user?.email);
}
