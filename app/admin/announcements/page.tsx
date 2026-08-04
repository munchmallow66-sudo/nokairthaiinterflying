"use client";

import * as React from "react";
import Image from "next/image";
import {
  Megaphone,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  FileText,
  Layers,
  Sparkles,
  Tag,
  Search,
  ArrowUpDown,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Uploader } from "@/components/ui/uploader";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/language-context";

export interface AnnouncementItem {
  id: string;
  title: string;
  content?: string | null;
  imageUrl?: string | null;
  imagePublicId?: string | null;
  linkUrl?: string | null;
  badge?: string | null;
  type: "TEXT" | "IMAGE" | "HYBRID";
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminAnnouncementsPage() {
  const { t } = useLanguage();
  const [announcements, setAnnouncements] = React.useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterType, setFilterType] = React.useState<string>("ALL");
  const [filterStatus, setFilterStatus] = React.useState<string>("ALL");

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState<AnnouncementItem | null>(null);

  // Form states
  const [formTitle, setFormTitle] = React.useState("");
  const [formContent, setFormContent] = React.useState("");
  const [formBadge, setFormBadge] = React.useState(t("adminAnnouncementsBadgeDefault"));
  const [formType, setFormType] = React.useState<"TEXT" | "IMAGE" | "HYBRID">("HYBRID");
  const [formImageUrl, setFormImageUrl] = React.useState("");
  const [formImagePublicId, setFormImagePublicId] = React.useState("");
  const [formLinkUrl, setFormLinkUrl] = React.useState("");
  const [formPriority, setFormPriority] = React.useState(0);
  const [formIsActive, setFormIsActive] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  // Fetch announcements from API
  const fetchAnnouncements = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/announcements?admin=true");
      const data = await res.json();
      if (data.success) {
        setAnnouncements(data.announcements || []);
      }
    } catch (err) {
      console.error("Failed to fetch announcements:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // Quick Toggle ON/OFF
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    // Optimistic UI update
    setAnnouncements((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isActive: !currentStatus } : item))
    );

    try {
      const res = await fetch(`/api/announcements/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      const data = await res.json();
      if (!data.success) {
        // Revert on error
        setAnnouncements((prev) =>
          prev.map((item) => (item.id === id ? { ...item, isActive: currentStatus } : item))
        );
      }
    } catch (err) {
      console.error("Failed to toggle status:", err);
      // Revert on error
      setAnnouncements((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isActive: currentStatus } : item))
      );
    }
  };

  // Open Add Modal
  const openAddModal = () => {
    setFormTitle("");
    setFormContent("");
    setFormBadge(t("adminAnnouncementsBadgeDefault"));
    setFormType("HYBRID");
    setFormImageUrl("");
    setFormImagePublicId("");
    setFormLinkUrl("");
    setFormPriority(0);
    setFormIsActive(true);
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (item: AnnouncementItem) => {
    setSelectedItem(item);
    setFormTitle(item.title || "");
    setFormContent(item.content || "");
    setFormBadge(item.badge || t("adminAnnouncementsBadgeDefault"));
    setFormType(item.type || "HYBRID");
    setFormImageUrl(item.imageUrl || "");
    setFormImagePublicId(item.imagePublicId || "");
    setFormLinkUrl(item.linkUrl || "");
    setFormPriority(item.priority || 0);
    setFormIsActive(item.isActive);
    setIsEditModalOpen(true);
  };

  // Create Announcement Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          content: formContent,
          badge: formBadge,
          type: formType,
          imageUrl: formImageUrl,
          imagePublicId: formImagePublicId,
          linkUrl: formLinkUrl,
          priority: Number(formPriority) || 0,
          isActive: formIsActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAddModalOpen(false);
        fetchAnnouncements();
      } else {
        alert(t("adminAnnouncementsErrPrefix") + data.error);
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert(t("adminAnnouncementsErrSave"));
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Announcement Submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !formTitle.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/announcements/${selectedItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          content: formContent,
          badge: formBadge,
          type: formType,
          imageUrl: formImageUrl,
          imagePublicId: formImagePublicId,
          linkUrl: formLinkUrl,
          priority: Number(formPriority) || 0,
          isActive: formIsActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsEditModalOpen(false);
        setSelectedItem(null);
        fetchAnnouncements();
      } else {
        alert(t("adminAnnouncementsErrPrefix") + data.error);
      }
    } catch (err) {
      console.error("Edit error:", err);
      alert(t("adminAnnouncementsErrUpdate"));
    } finally {
      setSubmitting(false);
    }
  };

  // Delete Announcement Submit
  const handleDeleteSubmit = async () => {
    if (!selectedItem) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/announcements/${selectedItem.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setIsDeleteModalOpen(false);
        setSelectedItem(null);
        fetchAnnouncements();
      } else {
        alert(t("adminAnnouncementsErrDeletePrefix") + data.error);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert(t("adminAnnouncementsErrDelete"));
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered List
  const filteredAnnouncements = announcements.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.content && item.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.badge && item.badge.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = filterType === "ALL" || item.type === filterType;
    const matchesStatus =
      filterStatus === "ALL" ||
      (filterStatus === "ACTIVE" && item.isActive) ||
      (filterStatus === "INACTIVE" && !item.isActive);

    return matchesSearch && matchesType && matchesStatus;
  });

  const totalCount = announcements.length;
  const activeCount = announcements.filter((a) => a.isActive).length;
  const inactiveCount = totalCount - activeCount;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Megaphone className="h-5 w-5 text-tif-gold animate-pulse" />
            <span className="text-xs text-slate-400 font-mono">{t("adminAnnouncementsCategory")}</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-white font-display tracking-tight">
            {t("adminAnnouncementsTitle")}
          </h1>
          <p className="text-xs lg:text-sm text-slate-400">
            {t("adminAnnouncementsDesc")}
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <Button
            onClick={openAddModal}
            variant="gold"
            size="md"
            className="shadow-lg shadow-tif-gold/10 font-bold"
          >
            <Plus className="mr-2 h-4 w-4" /> {t("adminAnnouncementsAddNew")}
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t("adminAnnouncementsTotal")}</span>
            <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2 font-mono">{totalCount}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t("adminAnnouncementsActive")}</span>
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Eye className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 mt-2 font-mono">{activeCount}</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{t("adminAnnouncementsInactive")}</span>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <EyeOff className="h-4 w-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-400 mt-2 font-mono">{inactiveCount}</p>
        </div>
      </div>

      {/* Controls Bar: Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={t("adminAnnouncementsSearchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-tif-gold"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-tif-gold"
          >
            <option value="ALL">{t("adminAnnouncementsFilterStatusAll")}</option>
            <option value="ACTIVE">{t("adminAnnouncementsFilterStatusActive")}</option>
            <option value="INACTIVE">{t("adminAnnouncementsFilterStatusInactive")}</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-tif-gold"
          >
            <option value="ALL">{t("adminAnnouncementsFilterTypeAll")}</option>
            <option value="TEXT">{t("adminAnnouncementsFilterTypeText")}</option>
            <option value="IMAGE">{t("adminAnnouncementsFilterTypeImage")}</option>
            <option value="HYBRID">{t("adminAnnouncementsFilterTypeHybrid")}</option>
          </select>

          <Button
            onClick={fetchAnnouncements}
            variant="outline"
            size="sm"
            className="border-slate-800 text-slate-300 hover:bg-slate-800"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800">
          <RefreshCw className="h-8 w-8 animate-spin text-tif-gold mb-3" />
          <p className="text-sm font-medium">{t("adminAnnouncementsLoading")}</p>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="text-center p-12 bg-slate-900/60 rounded-2xl border border-slate-800">
          <Megaphone className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white font-display">{t("adminAnnouncementsEmptyTitle")}</h3>
          <p className="text-xs text-slate-400 mt-1">
            {searchQuery ? t("adminAnnouncementsEmptySearchDesc") : t("adminAnnouncementsEmptyDefaultDesc")}
          </p>
          {!searchQuery && (
            <Button onClick={openAddModal} variant="gold" size="sm" className="mt-4">
              <Plus className="mr-1.5 h-4 w-4" /> {t("adminAnnouncementsAddNew")}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnnouncements.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col justify-between rounded-2xl border bg-slate-900/90 overflow-hidden shadow-xl transition-all duration-300 ${
                item.isActive
                  ? "border-slate-800 hover:border-tif-gold/50"
                  : "border-slate-800/50 opacity-60 bg-slate-950/80"
              }`}
            >
              <div>
                {/* Header & Image Preview */}
                {item.imageUrl ? (
                  <div className="relative h-44 w-full bg-slate-950 overflow-hidden group">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-tif-gold/90 text-tif-navyDark shadow-md">
                        {item.badge || t("adminAnnouncementsBadgeDefault")}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-900/90 text-slate-300 border border-slate-700">
                        {item.type}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-tif-gold/10 text-tif-gold border border-tif-gold/30">
                        {item.badge || t("adminAnnouncementsBadgeDefault")}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400">
                        {item.type}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      {t("adminAnnouncementsPriorityLabel")} {item.priority}
                    </span>
                  </div>
                )}

                {/* Content Body */}
                <div className="p-5 space-y-3">
                  <h3 className="text-base font-bold text-white font-display line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                  {item.content && (
                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {item.content}
                    </p>
                  )}
                  {item.linkUrl && (
                    <a
                      href={item.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-xs text-tif-gold hover:underline font-semibold"
                    >
                      <ExternalLink className="h-3.5 w-3.5 mr-1" />
                      {item.linkUrl}
                    </a>
                  )}
                </div>
              </div>

              {/* Card Footer: Quick On/Off Toggle & Actions */}
              <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
                {/* On/Off Toggle Button */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleActive(item.id, item.isActive)}
                    type="button"
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      item.isActive ? "bg-emerald-500" : "bg-slate-700"
                    }`}

                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        item.isActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <span className={`text-xs font-bold ${item.isActive ? "text-emerald-400" : "text-slate-500"}`}>
                    {item.isActive ? t("adminAnnouncementsStatusOn") : t("adminAnnouncementsStatusOff")}
                  </span>
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-2 rounded-xl text-slate-400 hover:text-tif-gold hover:bg-slate-900 border border-slate-800 transition"
                    title={t("adminAnnouncementsActionEdit")}
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setIsDeleteModalOpen(true);
                    }}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-slate-800 transition"
                    title={t("adminAnnouncementsActionDelete")}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================================================================ */}
      {/* MODAL 1: ADD ANNOUNCEMENT                                         */}
      {/* ================================================================ */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={t("adminAnnouncementsAddTitle")}
        description={t("adminAnnouncementsAddDesc")}
        maxWidth="xl"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              {t("adminAnnouncementsFieldTitle")} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={t("adminAnnouncementsFieldTitlePlaceholder")}
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-tif-gold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                {t("adminAnnouncementsFieldBadge")}
              </label>
              <select
                value={formBadge}
                onChange={(e) => setFormBadge(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-tif-gold"
              >
                <option value="ประกาศสำคัญ">{t("adminAnnouncementsBadgeImportant")}</option>
                <option value="โปรโมชั่น">{t("adminAnnouncementsBadgePromo")}</option>
                <option value="ข่าวสาร">{t("adminAnnouncementsBadgeNews")}</option>
                <option value="กำหนดการ">{t("adminAnnouncementsBadgeSchedule")}</option>
                <option value="สัมมนาฟรี">{t("adminAnnouncementsBadgeEvent")}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                {t("adminAnnouncementsFieldType")}
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-tif-gold"
              >
                <option value="HYBRID">{t("adminAnnouncementsTypeHybrid")}</option>
                <option value="IMAGE">{t("adminAnnouncementsTypeImage")}</option>
                <option value="TEXT">{t("adminAnnouncementsTypeText")}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              {t("adminAnnouncementsFieldContent")}
            </label>
            <textarea
              rows={3}
              placeholder={t("adminAnnouncementsFieldContentPlaceholder")}
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-tif-gold"
            />
          </div>

          {/* Cloudinary Uploader */}
          <div className="space-y-1">
            <Uploader
              label={t("adminAnnouncementsFieldImage")}
              type="announcements"
              accept="image/*"
              onUploadSuccess={(file) => {
                setFormImageUrl(file.secureUrl);
                setFormImagePublicId(file.publicId);
              }}
              onRemove={() => {
                setFormImageUrl("");
                setFormImagePublicId("");
              }}
            />
            {formImageUrl && (
              <p className="text-[10px] text-emerald-400 font-mono truncate">
                ✓ Image URL: {formImageUrl}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                {t("adminAnnouncementsFieldLink")}
              </label>
              <input
                type="text"
                placeholder={t("adminAnnouncementsFieldLinkPlaceholder")}
                value={formLinkUrl}
                onChange={(e) => setFormLinkUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-tif-gold font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                {t("adminAnnouncementsFieldPriority")}
              </label>
              <input
                type="number"
                value={formPriority}
                onChange={(e) => setFormPriority(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-tif-gold font-mono"
              />
            </div>
          </div>

          {/* Toggle Active Status */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <p className="text-xs font-bold text-white">{t("adminAnnouncementsFieldEnable")}</p>
              <p className="text-[11px] text-slate-400">{t("adminAnnouncementsFieldEnableDesc")}</p>
            </div>
            <button
              type="button"
              onClick={() => setFormIsActive(!formIsActive)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formIsActive ? "bg-emerald-500" : "bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formIsActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
              className="border-slate-800 text-slate-300 hover:bg-slate-800"
            >
              {t("adminAnnouncementsCancel")}
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              variant="gold"
              size="sm"
              className="font-bold"
            >
              {submitting ? t("adminAnnouncementsSubmittingAdd") : t("adminAnnouncementsSubmitAdd")}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================================================================ */}
      {/* MODAL 2: EDIT ANNOUNCEMENT                                        */}
      {/* ================================================================ */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedItem(null);
        }}
        title={t("adminAnnouncementsEditTitle")}
        description={t("adminAnnouncementsEditDesc")}
        maxWidth="xl"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              {t("adminAnnouncementsFieldTitle")} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-tif-gold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                {t("adminAnnouncementsFieldBadge")}
              </label>
              <select
                value={formBadge}
                onChange={(e) => setFormBadge(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-tif-gold"
              >
                <option value="ประกาศสำคัญ">{t("adminAnnouncementsBadgeImportant")}</option>
                <option value="โปรโมชั่น">{t("adminAnnouncementsBadgePromo")}</option>
                <option value="ข่าวสาร">{t("adminAnnouncementsBadgeNews")}</option>
                <option value="กำหนดการ">{t("adminAnnouncementsBadgeSchedule")}</option>
                <option value="สัมมนาฟรี">{t("adminAnnouncementsBadgeEvent")}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                {t("adminAnnouncementsFieldType")}
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-tif-gold"
              >
                <option value="HYBRID">{t("adminAnnouncementsTypeHybrid")}</option>
                <option value="IMAGE">{t("adminAnnouncementsTypeImage")}</option>
                <option value="TEXT">{t("adminAnnouncementsTypeText")}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              {t("adminAnnouncementsFieldContent")}
            </label>
            <textarea
              rows={3}
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-tif-gold"
            />
          </div>

          {/* Current image preview & replace uploader */}
          <div className="space-y-2">
            {formImageUrl && (
              <div className="flex items-center space-x-3 p-2 bg-slate-950 rounded-xl border border-slate-800">
                <img
                  src={formImageUrl}
                  alt="Preview"
                  className="h-14 w-20 object-cover rounded-lg"
                />
                <div className="truncate text-xs">
                  <p className="font-semibold text-slate-200">{t("adminAnnouncementsCurrentImage")}</p>
                  <a
                    href={formImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-tif-gold hover:underline text-[11px] truncate block"
                  >
                    {formImageUrl}
                  </a>
                </div>
              </div>
            )}
            <Uploader
              label={t("adminAnnouncementsChangeImage")}
              type="announcements"
              accept="image/*"
              onUploadSuccess={(file) => {
                setFormImageUrl(file.secureUrl);
                setFormImagePublicId(file.publicId);
              }}
              onRemove={() => {
                setFormImageUrl("");
                setFormImagePublicId("");
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                {t("adminAnnouncementsFieldLink")}
              </label>
              <input
                type="text"
                value={formLinkUrl}
                onChange={(e) => setFormLinkUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-tif-gold font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                {t("adminAnnouncementsFieldPriorityEdit")}
              </label>
              <input
                type="number"
                value={formPriority}
                onChange={(e) => setFormPriority(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-tif-gold font-mono"
              />
            </div>
          </div>

          {/* Toggle Active Status */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <div>
              <p className="text-xs font-bold text-white">{t("adminAnnouncementsFieldEnable")}</p>
              <p className="text-[11px] text-slate-400">{t("adminAnnouncementsFieldEnableEditDesc")}</p>
            </div>
            <button
              type="button"
              onClick={() => setFormIsActive(!formIsActive)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formIsActive ? "bg-emerald-500" : "bg-slate-700"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formIsActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditModalOpen(false)}
              className="border-slate-800 text-slate-300 hover:bg-slate-800"
            >
              {t("adminAnnouncementsCancel")}
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              variant="gold"
              size="sm"
              className="font-bold"
            >
              {submitting ? t("adminAnnouncementsSubmittingEdit") : t("adminAnnouncementsSubmitEdit")}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ================================================================ */}
      {/* MODAL 3: DELETE CONFIRMATION                                      */}
      {/* ================================================================ */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedItem(null);
        }}
        title={t("adminAnnouncementsDeleteTitle")}
        description={t("adminAnnouncementsDeleteDesc")}
        maxWidth="md"
      >
        <div className="space-y-4">
          {selectedItem && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-xs">
              <p className="font-bold">{t("adminAnnouncementsDeleteLabelTitle")} {selectedItem.title}</p>
              {selectedItem.badge && <p className="text-[11px] mt-1">{t("adminAnnouncementsDeleteLabelBadge")} {selectedItem.badge}</p>}
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteModalOpen(false)}
              className="border-slate-800 text-slate-300 hover:bg-slate-800"
            >
              {t("adminAnnouncementsCancel")}
            </Button>
            <Button
              type="button"
              onClick={handleDeleteSubmit}
              disabled={submitting}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
              size="sm"
            >
              {submitting ? t("adminAnnouncementsSubmittingDelete") : t("adminAnnouncementsSubmitDelete")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
