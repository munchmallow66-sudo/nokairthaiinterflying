// Shared persistent in-memory store for announcements fallback
let announcementsStore: any[] = [
  {
    id: "anc-1",
    title: "เปิดรับสมัคร Cadet Pilot 2026 รุ่นที่ 15 (Nok Air & TIF Program)",
    content: "สถาบันการบิน Thai Inter Flying ร่วมกับ Nok Air เปิดรับสมัครนักเรียนการบินพาณิชย์ตรีประจำปี 2026 พร้อมโควตาเข้าสัมภาษณ์สายการบินทันทีเมื่อสำเร็จการศึกษา",
    badge: "ประกาศสำคัญ",
    type: "HYBRID",
    imageUrl: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80",
    imagePublicId: "tif_sample_1",
    linkUrl: "/apply",
    isActive: true,
    priority: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    title: "สัมมนาแนะนำเส้นทางสู่นักบินพาณิชย์ ฟรี! (Open House 2026)",
    id: "anc-2",
    content: "ขอเชิญผู้สนใจร่วมงาน Open House ทดลองบินเครื่องจำลอง Flight Simulator ฟรี ณ ศูนย์ฝึกวิภาวดี ลงทะเบียนสำรองที่นั่งด่วน",
    badge: "โปรโมชั่น",
    type: "HYBRID",
    imageUrl: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=1200&q=80",
    imagePublicId: "tif_sample_2",
    linkUrl: "/admission",
    isActive: true,
    priority: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export function getAnnouncementsStore() {
  return announcementsStore;
}
