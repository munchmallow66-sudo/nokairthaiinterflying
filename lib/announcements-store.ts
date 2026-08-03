// Shared persistent in-memory store for announcements fallback
let announcementsStore: any[] = [];

export function getAnnouncementsStore() {
  return announcementsStore;
}
