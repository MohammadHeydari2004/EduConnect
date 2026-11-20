export function isDeadlineExpired(deadline: string): boolean {
  if (!deadline) return false;
  const deadlineTime = new Date(deadline).getTime();
  if (Number.isNaN(deadlineTime)) return false;
  return deadlineTime < Date.now();
}