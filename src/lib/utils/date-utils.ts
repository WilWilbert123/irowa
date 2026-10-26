// src/lib/utils/date-utils.ts

export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function isVerificationStale(lastVerifiedAt: string | null | undefined): boolean {
  if (!lastVerifiedAt) return true;
  const verifiedDate = new Date(lastVerifiedAt);
  const now = new Date();
  const diffDays = (now.getTime() - verifiedDate.getTime()) / (1000 * 3600 * 24);
  return diffDays > 30; // More than 30 days old is considered stale
}
