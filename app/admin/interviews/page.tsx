"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  Calendar,
  MapPin,
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Edit3,
  Trash2,
  Search,
  Users,
  Building2,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { formatDateTime, formatDate } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";
import { useApplicationContext } from "@/lib/context/application-context";

export default function InterviewsPage() {
  const { t } = useLanguage();
  const { applications, updateApplication } = useApplicationContext();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterStatus, setFilterStatus] = React.useState<string>("ALL");

  // Modals
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [selectedInterview, setSelectedInterview] = React.useState<any>(null);

  // Form states
  const [formAppId, setFormAppId] = React.useState("");
  const [formCandidateName, setFormCandidateName] = React.useState("");
  const [formAppNum, setFormAppNum] = React.useState("");
  const [formCourseName, setFormCourseName] = React.useState("Commercial Pilot License (CPL)");
  const [formInterviewer, setFormInterviewer] = React.useState("Capt. Thanawat (Chief Flight Instructor)");
  const [formLocation, setFormLocation] = React.useState("TIF Headquarters Room 302 / Zoom");
  const [formDate, setFormDate] = React.useState("2026-08-10T10:00");

  // Compile list of interviews from ApplicationContext applications
  const allInterviews = React.useMemo(() => {
    const list: any[] = [];

    applications.forEach((app) => {
      if (app.interviews && app.interviews.length > 0) {
        app.interviews.forEach((int) => {
          list.push({
            id: int.id,
            appId: app.id,
            candidate: `${app.student?.firstNameTh || app.student?.firstNameEn || ""} ${app.student?.lastNameTh || app.student?.lastNameEn || ""}`.trim() || "ผู้สมัครศิษย์บิน",
            appNum: app.applicationNumber,
            course: app.course?.name || "Commercial Pilot License (CPL)",
            interviewer: int.interviewer || "Capt. Thanawat",
            location: int.location || "TIF HQ Room 302",
            date: int.scheduledAt ? new Date(int.scheduledAt) : new Date(),
            status: int.passed === true ? "PASSED" : int.passed === false ? "FAILED" : "SCHEDULED",
            notes: (int as any).notes || int.result,
          });
        });
      } else if (app.status === "INTERVIEW_SCHEDULED" || app.status === "INTERVIEW_PASSED" || app.status === "WRITTEN_EXAM_PASSED") {
        // Fallback for applications in interview pipeline phase without explicit schedule object
        list.push({
          id: `int_auto_${app.id}`,
          appId: app.id,
          candidate: `${app.student?.firstNameTh || app.student?.firstNameEn || ""} ${app.student?.lastNameTh || app.student?.lastNameEn || ""}`.trim() || "ผู้สมัครศิษย์บิน",
          appNum: app.applicationNumber,
          course: app.course?.name || "Commercial Pilot License (CPL)",
          interviewer: "Capt. Thanawat (Chief Flight Instructor)",
          location: "TIF Headquarters Room 302 / Zoom",
          date: new Date(app.updatedAt || app.createdAt),
          status: app.status === "INTERVIEW_PASSED" ? "PASSED" : "SCHEDULED",
        });
      }
    });

    return list;
  }, [applications]);

  // Filtered interviews list
  const filteredInterviews = allInterviews.filter((item) => {
    const matchesSearch =
      item.candidate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.appNum.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.interviewer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === "ALL" || item.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // KPI Stats
  const totalCount = allInterviews.length;
  const scheduledCount = allInterviews.filter((i) => i.status === "SCHEDULED").length;
  const passedCount = allInterviews.filter((i) => i.status === "PASSED").length;
  const failedCount = allInterviews.filter((i) => i.status === "FAILED").length;

  // Handle Mark Passed / Failed
  const handleUpdateEvaluation = (item: any, result: "PASSED" | "FAILED") => {
    const app = applications.find((a) => a.id === item.appId || a.applicationNumber === item.appNum);
    if (!app) return;

    const updatedInterviews = (app.interviews || []).map((i) =>
      i.id === item.id || i.scheduledAt === item.date
        ? { ...i, passed: result === "PASSED", result: result === "PASSED" ? "Passed Evaluation" : "Failed Evaluation" }
        : i
    );

    if (updatedInterviews.length === 0) {
      updatedInterviews.push({
        id: `int_${Date.now()}`,
        scheduledAt: item.date,
        location: item.location,
        interviewer: item.interviewer,
        passed: result === "PASSED",
        result: result === "PASSED" ? "Passed Evaluation" : "Failed Evaluation",
      });
    }

    const newStatus = result === "PASSED" ? "INTERVIEW_PASSED" : "REJECTED";

    updateApplication(app.id, {
      status: newStatus as any,
      interviews: updatedInterviews,
    });

    alert(
      result === "PASSED"
        ? `บันทึกผลการสัมภาษณ์: ผ่านการประเมิน (PASSED) สำหรับใบสมัคร ${app.applicationNumber} เรียบร้อยแล้ว! สถานะอัปเดตไปหน้า /track แล้ว`
        : `บันทึกผลการสัมภาษณ์: ไม่ผ่านการประเมิน (FAILED) สำหรับใบสมัคร ${app.applicationNumber} เรียบร้อยแล้ว`
    );
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    const firstApp = applications[0];
    if (firstApp) {
      setFormAppId(firstApp.id);
      setFormAppNum(firstApp.applicationNumber);
      setFormCandidateName(`${firstApp.student?.firstNameTh || ""} ${firstApp.student?.lastNameTh || ""}`.trim());
      setFormCourseName(firstApp.course?.name || "Commercial Pilot License (CPL)");
    } else {
      setFormAppId("");
      setFormAppNum("TIF-2026-8812");
      setFormCandidateName("Somchai Jaidee");
      setFormCourseName("Commercial Pilot License (CPL)");
    }
    setFormInterviewer("Capt. Thanawat (Chief Flight Instructor)");
    setFormLocation("TIF Headquarters Room 302 / Zoom");
    setFormDate("2026-08-10T10:00");
    setAddModalOpen(true);
  };

  // Save Add Interview
  const handleSaveAdd = () => {
    const targetApp = applications.find(
      (a) => a.id === formAppId || a.applicationNumber === formAppNum
    );

    if (targetApp) {
      const newInterview = {
        id: `int_${Date.now()}`,
        scheduledAt: new Date(formDate),
        location: formLocation,
        interviewer: formInterviewer,
        passed: undefined,
      };

      updateApplication(targetApp.id, {
        status: "INTERVIEW_SCHEDULED" as any,
        interviews: [...(targetApp.interviews || []), newInterview],
      });
    }

    setAddModalOpen(false);
    alert("บันทึกการนัดหมายสอบสัมภาษณ์เรียบร้อยแล้ว ข้อมูลจะส่งตรงไปยังผู้สมัครในหน้า /track");
  };

  // Open Edit Modal
  const handleOpenEdit = (item: any) => {
    setSelectedInterview(item);
    setFormCandidateName(item.candidate);
    setFormAppNum(item.appNum);
    setFormCourseName(item.course);
    setFormInterviewer(item.interviewer);
    setFormLocation(item.location);
    const d = item.date instanceof Date ? item.date : new Date(item.date);
    setFormDate(d.toISOString().slice(0, 16));
    setEditModalOpen(true);
  };

  // Save Edit Interview
  const handleSaveEdit = () => {
    if (!selectedInterview) return;

    const targetApp = applications.find(
      (a) => a.id === selectedInterview.appId || a.applicationNumber === selectedInterview.appNum
    );

    if (targetApp) {
      const updatedInterviews = (targetApp.interviews || []).map((i) =>
        i.id === selectedInterview.id
          ? {
              ...i,
              scheduledAt: new Date(formDate),
              interviewer: formInterviewer,
              location: formLocation,
            }
          : i
      );

      updateApplication(targetApp.id, {
        interviews: updatedInterviews,
      });
    }

    setEditModalOpen(false);
    alert("บันทึกการแก้ไขการนัดหมายเรียบร้อยแล้ว");
  };

  // Delete Interview
  const handleDelete = (item: any) => {
    if (!window.confirm(`คุณต้องการลบการนัดหมายสัมภาษณ์ของ ${item.candidate} (${item.appNum}) ใช่หรือไม่?`)) return;

    const targetApp = applications.find(
      (a) => a.id === item.appId || a.applicationNumber === item.appNum
    );

    if (targetApp) {
      const updatedInterviews = (targetApp.interviews || []).filter(
        (i) => i.id !== item.id
      );
      updateApplication(targetApp.id, {
        interviews: updatedInterviews,
      });
    }

    alert("ลบรายการนัดหมายสัมภาษณ์เรียบร้อยแล้ว");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Users className="h-5 w-5 text-tif-gold animate-pulse" />
            <span className="text-xs text-slate-400 font-mono">Cadet Selection Interview Panel</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white font-display">
            {t("interviewsTitle")}
          </h1>
          <p className="text-xs lg:text-sm text-slate-400 mt-1">
            {t("interviewsSub")}
          </p>
        </div>
        <div>
          <Button variant="gold" size="md" onClick={handleOpenAdd} className="shadow-lg font-bold">
            <Plus className="mr-2 h-4 w-4" /> นัดหมายการสัมภาษณ์ใหม่
          </Button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">นัดหมายทั้งหมด</p>
            <p className="text-2xl font-bold text-white mt-1 font-mono">{totalCount}</p>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <Calendar className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">รอดำเนินการสัมภาษณ์</p>
            <p className="text-2xl font-bold text-purple-400 mt-1 font-mono">{scheduledCount}</p>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">ผ่านการสัมภาษณ์</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1 font-mono">{passedCount}</p>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">ไม่ผ่านการคัดเลือก</p>
            <p className="text-2xl font-bold text-rose-400 mt-1 font-mono">{failedCount}</p>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <XCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้สมัคร, รหัสใบสมัคร, ผู้สัมภาษณ์ หรือสถานที่..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-tif-gold"
          />
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-tif-gold font-medium"
          >
            <option value="ALL">สถานะทั้งหมด</option>
            <option value="SCHEDULED">รอดำเนินการสัมภาษณ์ (Scheduled)</option>
            <option value="PASSED">ผ่านการสัมภาษณ์ (Passed)</option>
            <option value="FAILED">ไม่ผ่านการประเมิน (Failed)</option>
          </select>
        </div>
      </div>

      {/* Main Grid Cards */}
      {filteredInterviews.length === 0 ? (
        <div className="text-center p-12 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-3">
          <Users className="h-12 w-12 text-slate-600 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-white font-display">ไม่พบรายการนัดหมายสัมภาษณ์</h3>
          <p className="text-xs text-slate-400">
            {searchQuery ? "ลองเปลี่ยนคำค้นหาหรือตัวกรองสถานะ" : "คลิกปุ่ม 'นัดหมายการสัมภาษณ์ใหม่' เพื่อสร้างรายการนัดหมายแรก"}
          </p>
          {!searchQuery && (
            <Button onClick={handleOpenAdd} variant="gold" size="sm" className="mt-2 font-bold">
              <Plus className="mr-1.5 h-4 w-4" /> เพิ่มการนัดหมายใหม่
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredInterviews.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4 backdrop-blur-xl hover:border-tif-gold/50 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-xs font-mono font-bold text-tif-gold px-2 py-0.5 rounded bg-tif-gold/10 border border-tif-gold/20">
                      {item.appNum}
                    </span>
                    <h3 className="text-lg font-bold text-white font-display mt-1.5">{item.candidate}</h3>
                    <p className="text-xs text-slate-400">{item.course}</p>
                  </div>
                  <div>
                    {item.status === "PASSED" ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {t("passedEvaluation")}
                      </span>
                    ) : item.status === "FAILED" ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center">
                        <XCircle className="w-3.5 h-3.5 mr-1" /> {t("notRecommended")}
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-400 border border-purple-500/30 flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1" /> {t("scheduledStatus")}
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-2.5 text-xs text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                  <p className="flex items-center font-mono">
                    <Calendar className="mr-2 h-4 w-4 text-tif-gold shrink-0" /> {formatDateTime(item.date)}
                  </p>
                  <p className="flex items-center">
                    <UserCheck className="mr-2 h-4 w-4 text-purple-400 shrink-0" /> {t("interviewerLabel")} {item.interviewer}
                  </p>
                  <p className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-cyan-400 shrink-0" /> {t("locationLabel")} {item.location}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-col space-y-2">
                {item.status === "SCHEDULED" && (
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="gold"
                      onClick={() => handleUpdateEvaluation(item, "PASSED")}
                      className="flex-1 justify-center font-bold bg-emerald-600 hover:bg-emerald-700 border-emerald-500"
                    >
                      <CheckCircle2 className="mr-1.5 h-4 w-4" /> {t("markPassedBtn")}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleUpdateEvaluation(item, "FAILED")}
                      className="flex-1 justify-center font-bold"
                    >
                      <XCircle className="mr-1.5 h-4 w-4" /> {t("markFailedBtn")}
                    </Button>
                  </div>
                )}

                <div className="flex items-center justify-end space-x-2 pt-1">
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-tif-gold hover:bg-slate-950 border border-slate-800 transition"
                    title="แก้ไขนัดหมาย"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-950 border border-slate-800 transition"
                    title="ลบรายการนัดหมาย"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Interview Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="เพิ่มการนัดหมายสัมภาษณ์ศิษย์บิน (Schedule Interview)"
        description="กำหนดวัน-เวลา สถานที่ และกรรมการผู้สัมภาษณ์สำหรับผู้สมัคร"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-300 block mb-1">เลือกผู้สมัครเรียน (Select Candidate) *</label>
            <select
              value={formAppId}
              onChange={(e) => {
                const selected = applications.find((a) => a.id === e.target.value);
                if (selected) {
                  setFormAppId(selected.id);
                  setFormAppNum(selected.applicationNumber);
                  setFormCandidateName(`${selected.student?.firstNameTh || ""} ${selected.student?.lastNameTh || ""}`.trim());
                  setFormCourseName(selected.course?.name || "Commercial Pilot License (CPL)");
                }
              }}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white focus:border-tif-gold focus:outline-none font-medium"
            >
              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.applicationNumber} — {app.student?.firstNameTh || app.student?.firstNameEn || "ผู้สมัคร"} {app.student?.lastNameTh || app.student?.lastNameEn || ""} ({app.course?.code || "CPL"})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">วัน-เวลาในการสัมภาษณ์ (Date & Time) *</label>
            <input
              type="datetime-local"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white focus:border-tif-gold focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">กรรมการผู้สัมภาษณ์ (Interviewer) *</label>
            <input
              value={formInterviewer}
              onChange={(e) => setFormInterviewer(e.target.value)}
              placeholder="เช่น Capt. Thanawat (Chief Flight Instructor)"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white focus:border-tif-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">สถานที่ / ช่องทางสัมภาษณ์ (Location / Platform) *</label>
            <input
              value={formLocation}
              onChange={(e) => setFormLocation(e.target.value)}
              placeholder="เช่น TIF HQ Room 302 / Zoom Meeting Link"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white focus:border-tif-gold focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="gold" size="sm" onClick={handleSaveAdd} className="font-bold">
              บันทึกการนัดหมายสัมภาษณ์
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Interview Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="แก้ไขการนัดหมายสัมภาษณ์"
        description={`ผู้สมัคร: ${formCandidateName} (${formAppNum})`}
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-300 block mb-1">วัน-เวลาในการสัมภาษณ์ (Date & Time)</label>
            <input
              type="datetime-local"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white focus:border-tif-gold focus:outline-none font-mono"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">กรรมการผู้สัมภาษณ์ (Interviewer)</label>
            <input
              value={formInterviewer}
              onChange={(e) => setFormInterviewer(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white focus:border-tif-gold focus:outline-none"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">สถานที่ / ช่องทางสัมภาษณ์ (Location)</label>
            <input
              value={formLocation}
              onChange={(e) => setFormLocation(e.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-sm text-white focus:border-tif-gold focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setEditModalOpen(false)}>
              ยกเลิก
            </Button>
            <Button variant="gold" size="sm" onClick={handleSaveEdit} className="font-bold">
              บันทึกการแก้ไข
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
