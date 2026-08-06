"use client";

import * as React from "react";
import { useState } from "react";
import {
  Search,
  CheckCircle2,
  Clock,
  User,
  FileText,
  Calendar,
  AlertCircle,
  Loader2,
  Sparkles,
  Award,
  MessageSquare,
  PenTool,
  CreditCard,
  Upload,
  Eye,
  MapPin,
  ExternalLink,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useLanguage } from "@/lib/i18n/language-context";
import { PILOT_WORKFLOW_STEPS } from "@/types";
import { compressImageIfNeeded } from "@/lib/image-compressor";
import { useApplicationContext } from "@/lib/context/application-context";
import { formatDocumentFileName, getCloudinaryPdfThumbnail } from "@/lib/utils";


interface ApplicationData {
  id: string;
  applicationNumber: string;
  courseName: string;
  status: string;
  statusLabelTh: string;
  statusLabelEn: string;
  submissionDate: string;
  stepIndex: number;
  remarks: string;
  updatedAt: string;
  joinOpenHouse?: boolean;
  documents?: {
    id: string;
    type: string;
    secureUrl: string;
    originalName: string;
    isVerified: boolean;
    isRejected?: boolean;
    rejectReason?: string;
  }[];
}

interface TrackingResponse {
  found: boolean;
  studentName?: string;
  nationalId?: string;
  applications?: ApplicationData[];
  error?: string;
}

const getStepGuidance = (app: ApplicationData, lang: "th" | "en" = "th") => {
  const status = app.status;
  const hasRejectedDocs = app.documents?.some((d) => d.isRejected);
  const hasSlipUploaded =
    status === "PAYMENT_PENDING" ||
    app.remarks?.includes("สลิป") ||
    app.remarks?.includes("Slip") ||
    app.remarks?.includes("โอนเงิน");
  const isEn = lang === "en";

  if (status === "REJECTED" && !hasRejectedDocs && (app.remarks?.includes("ขอบพระคุณ") || app.remarks?.includes("กำลังใจ") || app.remarks?.includes("เกณฑ์") || app.remarks?.includes("สัมภาษณ์") || app.remarks?.includes("สอบ"))) {
    const isInterview = app.remarks?.includes("สัมภาษณ์") || app.remarks?.includes("Interview");

    return {
      condition: isEn
        ? isInterview
          ? "💙 Condition: Thank You for Participating in Interview Selection (Step 11/13)"
          : "💙 Condition: Thank You for Participating in Written Exam Selection (Step 9/13)"
        : isInterview
        ? "💙 เงื่อนไข: สถาบันไทย อินเตอร์ ไฟลอิ้ง ขอขอบพระคุณที่เข้าร่วมการสอบสัมภาษณ์ (Step 11/13: ประกาศผลสัมภาษณ์)"
        : "💙 เงื่อนไข: สถาบันไทย อินเตอร์ ไฟลอิ้ง ขอขอบพระคุณที่เข้าร่วมการสอบข้อเขียน (Step 9/13: ประกาศผลสอบ)",
      badgeBg: "bg-blue-100 border-blue-300 text-blue-900 font-bold",
      icon: Sparkles,
      title: isEn
        ? isInterview
          ? "Thank You for Participating in Panel Interview"
          : "Thank You for Participating in Written Examination"
        : isInterview
        ? "💙 ขอขอบพระคุณอย่างยิ่งที่ท่านเข้าร่วมการสอบสัมภาษณ์คัดเลือกนักบิน"
        : "💙 ขอขอบพระคุณอย่างยิ่งที่ท่านเข้าร่วมการสอบข้อเขียนคัดเลือกนักบิน",
      description: isEn
        ? isInterview
          ? "Thai Inter Flying thanks you for your panel interview participation. Although you did not pass the interview criteria in this selection round, we encourage you on your aviation journey and hope to welcome you in the future."
          : "Thai Inter Flying thanks you for your written examination participation. Although you did not pass the written exam criteria in this selection round, we encourage you on your aviation journey and hope to welcome you in the future."
        : isInterview
        ? "สถาบันไทย อินเตอร์ ไฟลอิ้ง ขอขอบพระคุณท่านอย่างยิ่งที่ตั้งใจเข้าร่วมการสอบสัมภาษณ์คัดเลือกนักบินในครั้งนี้ แม้ผลการสัมภาษณ์จะยังไม่ผ่านเกณฑ์การคัดเลือก แต่คณะกรรมการขอเป็นกำลังใจให้ท่านในการเดินทางตามฝันสายการบินต่อไป และหวังเป็นอย่างยิ่งว่าจะได้มีโอกาสต้อนรับท่านอีกครั้งในโอกาสถัดไป"
        : "สถาบันไทย อินเตอร์ ไฟลอิ้ง ขอขอบพระคุณท่านอย่างยิ่งที่ตั้งใจเข้าร่วมการสอบข้อเขียนคัดเลือกนักบินในครั้งนี้ แม้ผลการสอบข้อเขียนจะยังไม่ผ่านเกณฑ์การคัดเลือก แต่สถาบันขอเป็นกำลังใจให้ท่านในการเดินทางตามฝันสายการบินต่อไป และหวังเป็นอย่างยิ่งว่าจะได้มีโอกาสต้อนรับท่านอีกครั้งในโอกาสถัดไป",
      nextActionTitle: isEn ? "Message from Institute:" : "ข้อความจากสถาบัน:",
      nextAction: isEn
        ? "Thai Inter Flying wishes you success on your pilot journey."
        : "สถาบันไทย อินเตอร์ ไฟลอิ้ง ขอขอบพระคุณและเป็นกำลังใจให้ท่านประสบความสำเร็จในเส้นทางสายการบินในอนาคต",
      actionType: "WAIT",
    };
  }

  if (status === "REJECTED" || hasRejectedDocs) {
    return {
      condition: isEn
        ? "🔴 Condition: Documents Incomplete / Action Required"
        : "🔴 เงื่อนไข: เอกสารไม่สมบูรณ์ / ต้องแก้ไขไฟล์เอกสารแนบ",
      badgeBg: "bg-rose-100 border-rose-300 text-rose-800",
      icon: AlertCircle,
      title: isEn
        ? "Your documents require attention (Please fix attached files)"
        : "เอกสารของคุณยังไม่ผ่านการอนุมัติ (กรุณาแก้ไขเอกสารแนบ)",
      description: isEn
        ? "Staff found incomplete or invalid document attachments. Please check the reason and re-upload replacement files."
        : "เจ้าหน้าที่ตรวจพบเอกสารที่ไม่ถูกต้องหรือไม่ชัดเจน กรุณาตรวจสอบเหตุผลและทำการอัปโหลดไฟล์ใหม่ทดแทน",
      nextActionTitle: isEn ? "Next Action for Applicant:" : "สิ่งที่ผู้สมัครต้องทำถัดไป:",
      nextAction: isEn
        ? "Click 'Re-upload File' on the document items below to submit for staff review."
        : "คลิกปุ่ม 'อัปโหลดส่งใหม่' ในรายการเอกสารด้านล่างที่ถูกแจ้งแก้ไข เพื่อส่งให้เจ้าหน้าที่ตรวจสอบอีกครั้ง",
      actionType: "REUPLOAD",
    };
  }

  switch (status) {
    case "ONLINE_REGISTRATION":
      return {
        condition: isEn
          ? "🔵 Condition: Online Application Open (Step 1/13)"
          : "🔵 เงื่อนไข: เปิดรับสมัครออนไลน์ (Step 1/13)",
        badgeBg: "bg-blue-100 border-blue-300 text-blue-800",
        icon: Clock,
        title: isEn ? "Online Registration Opened" : "เปิดรับสมัครออนไลน์เรียบร้อยแล้ว",
        description: isEn
          ? "You have registered your applicant account in the pilot application system."
          : "ท่านได้ลงทะเบียนบัญชีสมัครเข้าสู่ระบบรับสมัครนักบินเรียบร้อยแล้ว",
        nextActionTitle: isEn ? "Next Action for Applicant:" : "สิ่งที่ผู้สมัครต้องทำถัดไป:",
        nextAction: isEn
          ? "Please fill in personal details, education history, language scores, and attach all required documents."
          : "กรุณากรอกข้อมูลส่วนตัว ประวัติการศึกษา ผลสอบภาษา และอัปโหลดเอกสารแนบให้ครบถ้วนตามที่กำหนด",
        actionType: "FILL_FORM",
      };

    case "SUBMITTED":
      return {
        condition: isEn
          ? "🟡 Condition: Application Submitted (Step 2/13)"
          : "🟡 เงื่อนไข: ยื่นใบสมัครเรียบร้อยแล้ว (Step 2/13)",
        badgeBg: "bg-amber-100 border-amber-300 text-amber-900",
        icon: Clock,
        title: isEn
          ? "Application & Documents Submitted"
          : "ยื่นใบสมัครและแนบเอกสารเรียบร้อยแล้ว (Submitted & Attached Docs)",
        description: isEn
          ? "Application data and attached documents are saved in the system, preparing for staff verification."
          : "ระบบบันทึกข้อมูลใบสมัครและเอกสารแนบเรียบร้อยแล้ว อยู่ระหว่างการเตรียมเข้าสู่กระบวนการตรวจเอกสารโดยเจ้าหน้าที่",
        nextActionTitle: isEn ? "Next Action for Applicant:" : "สิ่งที่ผู้สมัครต้องทำถัดไป:",
        nextAction: isEn
          ? "Please wait while staff conducts daily document verification."
          : "รอเจ้าหน้าที่เริ่มทำการตรวจสอบเอกสารประจำวัน",
        actionType: "WAIT",
      };

    case "DOCS_UNDER_REVIEW":
    case "WAITING_DOCUMENTS":
      return {
        condition: isEn
          ? "🟡 Condition: Initial Document Review in Progress (Step 3/13)"
          : "🟡 เงื่อนไข: อยู่ระหว่างรอการตรวจเอกสารเบื้องต้น (Step 3/13)",
        badgeBg: "bg-orange-100 border-orange-300 text-orange-900",
        icon: Clock,
        title: isEn
          ? "Documents Currently Under Staff Review"
          : "อยู่ระหว่างเจ้าหน้าที่ตรวจสอบเอกสารเบื้องต้น (Docs Under Review)",
        description: isEn
          ? "Your attached documents have been received. Staff is verifying accuracy and initial qualifications."
          : "เอกสารแนบของคุณถูกส่งเข้าสู่ระบบแล้ว เจ้าหน้าที่กำลังดำเนินการตรวจสอบความถูกต้องและคุณสมบัติเบื้องต้น",
        nextActionTitle: isEn ? "Next Action for Applicant:" : "สิ่งที่ผู้สมัครต้องทำถัดไป:",
        nextAction: isEn
          ? "No action needed. Staff will complete verification and notify approval within 24 hours."
          : "ไม่ต้องดำเนินการใดๆ เจ้าหน้าที่จะทำการตรวจสอบและแจ้งผลอนุมัติภายใน 24 ชั่วโมง",
        actionType: "WAIT",
      };

    case "DOCS_PASSED":
    case "DOCUMENT_VERIFIED":
    case "APPLICATION_FEE_PAID":
      if (hasSlipUploaded) {
        return {
          condition: isEn
            ? "🟢 Condition: Payment Slip Uploaded (Pending Staff Verification)"
            : "🟢 เงื่อนไข: แนบสลิปโอนเงินเรียบร้อยแล้ว (อยู่ระหว่างรอเจ้าหน้าที่ตรวจสอบ)",
          badgeBg: "bg-emerald-100 border-emerald-300 text-emerald-900 font-bold",
          icon: CheckCircle2,
          title: isEn
            ? "Payment Slip Received (Under Review)"
            : "ได้รับสลิปโอนเงินเรียบร้อยแล้ว (อยู่ระหว่างรอตรวจสอบ)",
          description: isEn
            ? "Your 1,800 THB payment proof and Open House preference have been recorded. Finance team is verifying the payment transaction."
            : "ระบบได้รับการแนบหลักฐานการโอนเงิน 1,800 บาท และบันทึกข้อมูลความประสงค์ Open House ของท่านเรียบร้อยแล้ว เจ้าหน้าที่จะทำการตรวจสอบยอดเงินและอนุมัติการสมัครภายใน 24 ชม.",
          nextActionTitle: isEn ? "Next Action for Applicant:" : "สิ่งที่ผู้สมัครต้องทำถัดไป:",
          nextAction: isEn
            ? "Wait for staff payment verification. Status will automatically update upon approval. (You can view or re-attach slip using the button below)."
            : "รอเจ้าหน้าที่ตรวจสอบสลิปโอนเงิน เมื่ออนุมัติแล้วระบบจะปรับสถานะเป็นขั้นตอนถัดไปให้อัตโนมัติ (ท่านสามารถคลิกดูหรือแนบสลิปใหม่ได้ที่ปุ่มด้านล่าง)",
          actionType: "SLIP_SUBMITTED",
        };
      }
      return {
        condition: isEn
          ? "🟢 Condition: Document Review Completed (Step 5/13: Pay 1,800 THB Application Fee)"
          : "🟢 เงื่อนไข: ผ่านการตรวจเอกสารเรียบร้อยแล้ว (Step 5/13: ชำระค่าสมัคร 1,800 บาท)",
        badgeBg: "bg-emerald-100 border-emerald-300 text-emerald-900 font-bold",
        icon: CheckCircle2,
        title: isEn
          ? "Initial Document Review Passed (Ready for 1,800 THB Fee Payment)"
          : "ผ่านการตรวจเอกสารเบื้องต้นเรียบร้อยแล้ว (พร้อมชำระค่าสมัคร 1,800 บาท)",
        description: isEn
          ? "Your documents are complete and approved. Please transfer the 1,800 THB application fee and attach the payment slip."
          : "เอกสารของท่านถูกต้องสมบูรณ์ ระบบได้รับการอนุมัติจากเจ้าหน้าที่ให้ท่านดำเนินการโอนเงินค่าธรรมเนียมสมัครเรียน 1,800 บาท และแนบสลิปชำระเงิน",
        nextActionTitle: isEn ? "Next Action for Applicant:" : "สิ่งที่ผู้สมัครต้องทำถัดไป:",
        nextAction: isEn
          ? "Transfer 1,800 THB to SCB Acc # 202-280661-2 (Thai Inter Flying Co., Ltd.), then click 'Attach Payment Slip 1,800 THB' below and select Open House attendance preference."
          : "โอนเงินค่าสมัคร 1,800 บาท เข้าบัญชี SCB เลขที่ 202-280661-2 (บจ. ไทย อินเตอร์ ไฟลอิ้ง) แล้วคลิกปุ่ม 'แนบสลิปชำระเงิน 1,800 THB' ด้านล่างพร้อมเลือกความประสงค์เข้าร่วมงาน Open House",
        actionType: "PAY",
      };

    case "PAYMENT_PENDING":
      return {
        condition: isEn
          ? "🟡 Condition: Payment Slip Under Verification (Step 5/13)"
          : "🟡 เงื่อนไข: อยู่ระหว่างตรวจสอบสลิปชำระเงิน 1,800 บาท (Step 5/13)",
        badgeBg: "bg-amber-100 border-amber-300 text-amber-900",
        icon: Clock,
        title: isEn
          ? "Payment Slip Received — Verification in Progress"
          : "ได้รับสลิปชำระเงินเรียบร้อยแล้ว — อยู่ระหว่างการตรวจสอบสลิป",
        description: isEn
          ? "1,800 THB transfer proof received. Finance team is verifying the payment transaction."
          : "ระบบได้รับการแนบหลักฐานการโอนเงิน 1,800 บาทเรียบร้อยแล้ว ฝ่ายการเงินกำลังดำเนินการตรวจสอบยอดเงิน",
        nextActionTitle: isEn ? "Next Action for Applicant:" : "สิ่งที่ผู้สมัครต้องทำถัดไป:",
        nextAction: isEn
          ? "Wait for staff payment approval. Upon approval, status will automatically update to Step 6."
          : "รอเจ้าหน้าที่อนุมัติสลิปโอนเงิน เมื่ออนุมัติแล้วระบบจะเลื่อนสถานะเป็น Step 6 ให้อัตโนมัติ",
        actionType: "WAIT",
      };

    case "PAID":
    case "PAYMENT_VERIFIED":
    case "OPEN_HOUSE_ATTENDED":
      return {
        condition: isEn
          ? "🟢 Condition: Payment Approved (Step 6/13: Open House Attended)"
          : "🟢 เงื่อนไข: อนุมัติการชำระเงินเรียบร้อยแล้ว (Step 6/13: Open House Attended)",
        badgeBg: "bg-indigo-100 border-indigo-300 text-indigo-900",
        icon: CheckCircle2,
        title: isEn
          ? "Payment Slip Approved (Prepare for Open House Event)"
          : "อนุมัติสลิปชำระเงินเรียบร้อยแล้ว (เตรียมเข้าร่วมงาน Open House)",
        description: isEn
          ? "Staff confirmed your 1,800 THB application fee payment. You are registered for the Open House event."
          : "เจ้าหน้าที่ยืนยันการชำระค่าสมัคร 1,800 บาทสำเร็จแล้ว ท่านได้รับสิทธิ์ในการเข้าร่วมกิจกรรมแนะนำโครงการ Open House",
        nextActionTitle: isEn ? "Next Action for Applicant:" : "สิ่งที่ผู้สมัครต้องทำถัดไป:",
        nextAction: isEn
          ? "Prepare to join Open House on September 12, 2026, 09:00 - 15:00 at Best Western Plus Wanda Grand Hotel (Ballroom A)."
          : "เตรียมความพร้อมเข้าร่วมงาน Open House ในวันที่ 12 กันยายน 2026 เวลา 09:00 - 15:00 น. ณ โรงแรม Best Western Plus Wanda Grand Hotel (Ballroom A)",
        actionType: "OPEN_HOUSE",
      };

    case "PHYSICAL_DOCS_SUBMITTED":
      return {
        condition: isEn
          ? "🟢 Condition: Open House Attended (Step 7/13: Physical Docs Submitted)"
          : "🟢 เงื่อนไข: เข้าร่วมงาน Open House เรียบร้อย (Step 7/13: Physical Docs Submitted)",
        badgeBg: "bg-sky-100 border-sky-300 text-sky-900",
        icon: CheckCircle2,
        title: isEn
          ? "Original Physical Documents Submitted"
          : "ยื่นเอกสารฉบับจริงเรียบร้อยแล้ว",
        description: isEn
          ? "Original physical documents verified and logged into cadet pilot records."
          : "เอกสารฉบับจริงได้รับการตรวจสอบและบันทึกเข้าสู่แฟ้มประวัตินักบินเรียบร้อยแล้ว",
        nextActionTitle: isEn ? "Next Action for Applicant:" : "สิ่งที่ผู้สมัครต้องทำถัดไป:",
        nextAction: isEn
          ? "Prepare for the Written Examination."
          : "เตรียมความพร้อมสำหรับการทดสอบภาคข้อเขียน (Written Examination)",
        actionType: "WAIT",
      };

    case "WRITTEN_EXAM":
      return {
        condition: isEn
          ? "🟡 Condition: Written Exam Scheduled (Step 8/13)"
          : "🟡 เงื่อนไข: กำหนดวันสอบข้อเขียน (Step 8/13: Written Exam Scheduled)",
        badgeBg: "bg-purple-100 border-purple-300 text-purple-900",
        icon: Clock,
        title: isEn
          ? "Written Examination Schedule Announced"
          : "กำหนดการทดสอบภาคข้อเขียน (Written Examination Schedule)",
        description: isEn
          ? "You are qualified to sit for the Nok Air Cadet Pilot Program Written Examination."
          : "ท่านได้รับการคัดเลือกและมีสิทธิ์เข้ารับการสอบข้อเขียนในโครงการ Nok Air Cadet Pilot Program",
        nextActionTitle: isEn ? "Exam Schedule & Venue:" : "กำหนดการและสถานที่สอบข้อเขียน:",
        nextAction: isEn
          ? "📅 Exam Date: 26 Sept 2026 | ⏰ Time: TBD | 📍 Venue: Rangsit University"
          : "📅 วันที่สอบ: 26 กันยายน 2569 | ⏰ เวลาสอบ: XX:XX - XX:XX น. (จะแจ้งให้ทราบอีกครั้ง) | 📍 สถานที่สอบ: มหาวิทยาลัยรังสิต",
        actionType: "EXAM",
      };

    case "WRITTEN_EXAM_PASSED":
      return {
        condition: isEn
          ? "🟢 Condition: Written Exam Results (Step 9/13: Passed Exam)"
          : "🟢 เงื่อนไข: ประกาศผลสอบ (Step 9/13: ผ่านการสอบข้อเขียนเรียบร้อยแล้ว)",
        badgeBg: "bg-emerald-100 border-emerald-300 text-emerald-900 font-bold",
        icon: CheckCircle2,
        title: isEn
          ? "🎉 Congratulations! Passed Written Examination"
          : "🎉 ขอแสดงความยินดีด้วย! ท่านผ่านการสอบข้อเขียนเรียบร้อยแล้ว",
        description: isEn
          ? "Your written exam score met the required standards for the Cadet Pilot Program. You are qualified for the panel interview stage."
          : "ผลคะแนนสอบข้อเขียนของท่านผ่านเกณฑ์มาตรฐานการรับสมัครนักบินของโครงการ สถาบันขอแสดงความยินดีและขอให้ท่านเตรียมความพร้อมสำหรับขั้นตอนสอบสัมภาษณ์ต่อไป",
        nextActionTitle: isEn ? "Next Action for Applicant:" : "สิ่งที่ผู้สมัครต้องทำถัดไป:",
        nextAction: isEn
          ? "Await official interview schedule announcement."
          : "รอเจ้าหน้าที่ประกาศตารางนัดหมายและรายละเอียดวันสอบสัมภาษณ์ (Interview)",
        actionType: "WAIT",
      };

    case "INTERVIEW_SCHEDULED":
      return {
        condition: isEn
          ? "🟡 Condition: Interview Scheduled (Step 10/13)"
          : "🟡 เงื่อนไข: กำหนดวันสอบสัมภาษณ์ (Step 10/13: Interview Scheduled)",
        badgeBg: "bg-purple-100 border-purple-300 text-purple-900",
        icon: Clock,
        title: isEn
          ? "Panel Interview Scheduled"
          : "กำหนดวันสอบสัมภาษณ์กับคณะกรรมการ (Interview)",
        description: isEn
          ? "Staff scheduled your panel interview to evaluate aptitude, personality, and pilot readiness."
          : "เจ้าหน้าที่ได้ทำการนัดหมายวันสัมภาษณ์ประเมินทัศนคติ บุคลิกภาพ และความพร้อมในการเป็นนักบิน",
        nextActionTitle: isEn ? "Next Action for Applicant:" : "สิ่งที่ผู้สมัครต้องทำถัดไป:",
        nextAction: isEn
          ? "Attend the interview in formal attire and bring portfolio documents if available."
          : "เข้าร่วมการสัมภาษณ์ตามกำหนดการ แต่งกายชุดสุภาพเรียบร้อย และเตรียมเอกสารพอร์ตโฟลิโอ (ถ้ามี)",
        actionType: "INTERVIEW",
      };

    case "INTERVIEW_PASSED":
      return {
        condition: isEn
          ? "🟢 Condition: Interview Results (Step 11/13: Passed Panel Interview)"
          : "🟢 เงื่อนไข: ผ่านการสอบสัมภาษณ์เรียบร้อยแล้ว (Step 11/13: ประกาศผลสัมภาษณ์)",
        badgeBg: "bg-emerald-100 border-emerald-300 text-emerald-900 font-bold",
        icon: CheckCircle2,
        title: isEn
          ? "🎉 Congratulations! Passed Panel Interview"
          : "🎉 ขอแสดงความยินดีด้วย! ท่านผ่านการสอบสัมภาษณ์เรียบร้อยแล้ว",
        description: isEn
          ? "Panel approved your interview. You advance to Aviation Medical Class 1 Examination."
          : "คณะกรรมการอนุมัติผลการสัมภาษณ์เรียบร้อยแล้ว ท่านผ่านเข้าสู่ขั้นตอนการตรวจร่างกายทางเวชศาสตร์การบิน (Medical Class 1 Check)",
        nextActionTitle: isEn ? "Next Action for Applicant:" : "สิ่งที่ผู้สมัครต้องทำถัดไป:",
        nextAction: isEn
          ? "Undergo Medical Class 1 examination at an accredited aviation medical institute."
          : "เข้ารับการตรวจสุขภาพนักบิน Class 1 (Medical Class 1 Check) ณ สถาบันเวชศาสตร์การบิน",
        actionType: "MEDICAL",
      };

    case "MEDICAL_CHECK_CLASS_1":
      return {
        condition: isEn
          ? "🟡 Condition: Medical Class 1 Check (Step 12/13)"
          : "🟡 เงื่อนไข: ตรวจสุขภาพ Class 1 (Step 12/13: Class 1 Medical Check)",
        badgeBg: "bg-pink-100 border-pink-300 text-pink-900",
        icon: Clock,
        title: isEn
          ? "Aviation Medical Class 1 Examination"
          : "เข้ารับการตรวจสุขภาพ Class 1 เวชศาสตร์การบิน",
        description: isEn
          ? "Undergoing comprehensive medical evaluation for Class 1 Medical Certificate issuance."
          : "อยู่ระหว่างการตรวจร่างกายอย่างละเอียดและการออกใบรับรองแพทย์ชั้นหนึ่ง (Class 1 Medical Certificate)",
        nextActionTitle: isEn ? "Next Action for Applicant:" : "สิ่งที่ผู้สมัครต้องทำถัดไป:",
        nextAction: isEn
          ? "Once Class 1 Medical Certificate is issued, submit proof to confirm your enrollment."
          : "เมื่อได้รับใบรับรองแพทย์ Class 1 แล้ว กรุณายื่นหลักฐานแก่เจ้าหน้าที่เพื่อยืนยันสิทธิ์สำเร็จ",
        actionType: "WAIT",
      };

    case "ACCEPTANCE_CONFIRMED":
    case "ACCEPTED":
    case "ENROLLED":
      return {
        condition: isEn
          ? "🏆 Condition: Acceptance Confirmed (Step 13/13)"
          : "🏆 เงื่อนไข: ยืนยันสิทธิ์สำเร็จ (Step 13/13: Acceptance Confirmed)",
        badgeBg: "bg-amber-100 border-amber-300 text-amber-950 font-bold",
        icon: Sparkles,
        title: isEn
          ? "🎉 Cadet Pilot Program Acceptance Confirmed!"
          : "🎉 ยืนยันสิทธิ์เข้าศึกษาโครงการนักบินสำเร็จ (Acceptance Confirmed)",
        description: isEn
          ? "Congratulations! You are officially selected and confirmed for Nok Air Cadet Pilot Program."
          : "ท่านได้รับการคัดเลือกและยืนยันสิทธิ์เข้าศึกษาในหลักสูตร Nok Air Cadet Pilot Program เรียบร้อยแล้ว!",
        nextActionTitle: isEn ? "Instructions for New Cadets:" : "คำแนะนำสำหรับนักบินใหม่:",
        nextAction: isEn
          ? "Congratulations! Staff will contact you with contract signing and orientation details."
          : "ขอแสดงความยินดีด้วย! เจ้าหน้าที่จะติดต่อท่านเพื่อแจ้งกำหนดการทำสัญญาและการปฐมนิเทศนักบินใหม่",
        actionType: "SUCCESS",
      };

    default:
      return {
        condition: isEn
          ? "🔵 Condition: Application Submitted"
          : "🔵 เงื่อนไข: ยื่นใบสมัครเรียบร้อยแล้ว",
        badgeBg: "bg-slate-100 border-slate-300 text-slate-800",
        icon: Clock,
        title: isEn ? "Application Under Processing" : "ใบสมัครอยู่ระหว่างการประมวลผล",
        description: isEn
          ? "Your application data has been safely received."
          : "ข้อมูลของท่านเข้าสู่ระบบเรียบร้อยแล้ว",
        nextActionTitle: isEn ? "Next Action for Applicant:" : "สิ่งที่ผู้สมัครต้องทำถัดไป:",
        nextAction: isEn
          ? "Follow status updates on this portal."
          : "ติดตามการอัปเดตสถานะจากเจ้าหน้าที่ทางหน้าเว็บนี้",
        actionType: "WAIT",
      };
  }
};

const getDocTypeLabel = (type: string, t: (key: any) => string): string => {
  const map: Record<string, string> = {
    PHOTO_1_INCH: t("docPassportPhoto"),
    PASSPORT_PHOTO: t("docPassportPhoto"),
    NATIONAL_ID_CERTIFIED: t("docNationalId"),
    NATIONAL_ID: t("docNationalId"),
    TRANSCRIPT_CERTIFIED: t("docTranscript"),
    TRANSCRIPT: t("docTranscript"),
    HOUSE_REGISTRATION_CERTIFIED: t("docHouseRegistration"),
    HOUSE_REGISTRATION: t("docHouseRegistration"),
    MEDICAL_CERTIFICATE_CLASS_1: t("docMedicalCert"),
    MEDICAL_CERT: t("docMedicalCert"),
    CRIMINAL_RECORD_CHECK: t("docOther"),
    MILITARY_SERVICE_EXEMPTION: t("docMilitary"),
  };
  return map[type] || type;
};

const formatRemarks = (remarks?: string, stepIndex?: number, lang: "th" | "en" = "th") => {
  const isEn = lang === "en";
  if (!remarks) return isEn ? "Staff is processing step by step" : "เจ้าหน้าที่กำลังดำเนินการตามลำดับขั้นตอน";
  
  if (stepIndex !== 5) {
    let cleaned = remarks
      .replace(/อนุมัติสลิปการชำระเงิน\s*1,800\s*บาทเรียบร้อยแล้ว/gi, "")
      .replace(/อนุมัติสลิปการชำระเงิน\s*1800\s*บาทเรียบร้อยแล้ว/gi, "")
      .replace(/อนุมัติสลิปการชำระเงิน\s*เรียบร้อยแล้ว/gi, "")
      .replace(/ได้รับสลิปโอนเงินเรียบร้อยแล้ว/gi, "")
      .replace(/อัปโหลดสลิป\s*1,800\s*บาทเรียบร้อยแล้ว/gi, "")
      .replace(/ชำระค่าสมัคร\s*1,800\s*บาทเรียบร้อยแล้ว/gi, "")
      .trim();

    cleaned = cleaned.replace(/^\(\s*สถานะ:\s*/, "").replace(/\)\s*$/, "").trim();
    if (!cleaned || cleaned.startsWith("ไม่ประสงค์เข้าร่วมงาน") || cleaned.startsWith("ลงทะเบียนเข้าร่วมงาน")) {
      return isEn ? "Staff has verified application details" : "เจ้าหน้าที่ได้ดำเนินการตรวจสอบข้อมูลเรียบร้อยแล้ว";
    }
    return cleaned;
  }

  return remarks;
};

export default function TrackStatusPage() {
  const { t, language } = useLanguage();
  const { applications: ctxApps, updateApplication } = useApplicationContext();
  const [nationalId, setNationalId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackingResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showAllDocsMap, setShowAllDocsMap] = useState<Record<string, boolean>>({});

  // Payment Slip Modal States
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [activePayAppNum, setActivePayAppNum] = useState("");
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [uploadingSlip, setUploadingSlip] = useState(false);
  const [slipSuccess, setSlipSuccess] = useState(false);
  const [joinOpenHouse, setJoinOpenHouse] = useState<boolean | null>(null);
  const [openHouseAttendees, setOpenHouseAttendees] = useState(1);

  // Re-upload Document Modal States
  const [reuploadModalOpen, setReuploadModalOpen] = useState(false);
  const [activeReuploadDoc, setActiveReuploadDoc] = useState<any>(null);
  const [reuploadType, setReuploadType] = useState("NATIONAL_ID");
  const [reuploadFile, setReuploadFile] = useState<File | null>(null);
  const [uploadingReupload, setUploadingReupload] = useState(false);

  const handleOpenPayModal = (appNum: string) => {
    setActivePayAppNum(appNum);
    setSlipFile(null);
    const existingApp = result?.applications?.find((a) => a.applicationNumber === appNum);
    setJoinOpenHouse(existingApp?.joinOpenHouse ?? null);
    setSlipSuccess(false);
    setPayModalOpen(true);
  };

  const handleOpenReuploadModal = (appNum: string, doc?: any) => {
    setActivePayAppNum(appNum);
    setActiveReuploadDoc(doc || null);
    setReuploadType(doc?.type || "NATIONAL_ID");
    setReuploadFile(null);
    setReuploadModalOpen(true);
  };

  const handleConfirmReupload = () => {
    if (!reuploadFile) {
      alert(t("selectDocAlert"));
      return;
    }
    setUploadingReupload(true);

    setTimeout(() => {
      setUploadingReupload(false);
      setReuploadModalOpen(false);

      if (result && result.applications) {
        setResult({
          ...result,
          applications: result.applications.map((a) =>
            a.applicationNumber === activePayAppNum
              ? {
                  ...a,
                  status: "SUBMITTED",
                  statusLabelTh: "อัปโหลดเอกสารฉบับใหม่เรียบร้อยแล้ว (รอเจ้าหน้าที่ตรวจสอบ)",
                  statusLabelEn: "New document uploaded successfully (Pending Staff Verification)",
                  remarks: `ส่งเอกสารใหม่ "${reuploadFile.name}" เข้าสู่ระบบเรียบร้อยแล้ว เจ้าหน้าที่จะดำเนินการตรวจสอบอีกครั้ง`,
                  documents: [
                    ...(a.documents?.filter((d) => d.id !== activeReuploadDoc?.id) || []),
                    {
                      id: activeReuploadDoc?.id || `doc_${Date.now()}`,
                      type: reuploadType,
                      secureUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
                      originalName: formatDocumentFileName(
                        activePayAppNum,
                        "",
                        result?.studentName?.split(" ")[0] || "",
                        reuploadType,
                        reuploadFile.name
                      ),
                      isVerified: false,
                      isRejected: false,
                    },
                  ],
                }
              : a
          ),
        });
      }
      alert(t("reuploadSuccessAlert"));
    }, 1200);
  };

  const handleConfirmSubmitSlip = async () => {
    if (joinOpenHouse === null) {
      alert(t("selectOpenHouseChoiceAlert"));
      return;
    }
    if (!slipFile) {
      alert(t("selectSlipAlert"));
      return;
    }
    setUploadingSlip(true);

    try {
      const slipDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(slipFile);
      });

      await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appNum: activePayAppNum || "TIF-2026-1973",
          studentName: result?.studentName || "Somchai Jaidee",
          amount: 1800,
          slipUrl: slipDataUrl,
          joinOpenHouse,
          openHouseAttendees: joinOpenHouse ? openHouseAttendees : 0,
        }),
      });
    } catch (e) {}

    const openHouseRemarks = joinOpenHouse
      ? `${t("openHouseRemarkYes")} (จำนวน ${openHouseAttendees} ท่าน)`
      : t("openHouseRemarkNo");

    setTimeout(() => {
      setUploadingSlip(false);
      setSlipSuccess(true);

      const updatedRemarks = `${t("slipReceivedRemarks")}${openHouseRemarks}`;

      updateApplication(activePayAppNum, {
        remarks: updatedRemarks,
        joinOpenHouse: joinOpenHouse,
      });

      if (result && result.applications) {
        setResult({
          ...result,
          applications: result.applications.map((a) =>
            a.applicationNumber === activePayAppNum
              ? {
                  ...a,
                  statusLabelTh: "อัปโหลดสลิป 1,800 บาทเรียบร้อยแล้ว (เจ้าหน้ากำลังตรวจสอบ)",
                  statusLabelEn: "Payment slip 1,800 THB uploaded (Staff reviewing)",
                  remarks: updatedRemarks,
                  joinOpenHouse: joinOpenHouse,
                }
              : a
          ),
        });
      }
      alert(`${t("slipSuccessAlert")} (${activePayAppNum})`);
    }, 1200);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    const queryValue = nationalId.trim();
    if (!queryValue) {
      setErrorMsg(t("trackSearchInputErr"));
      return;
    }

    setLoading(true);
    setResult(null);

    // 1. Search from ApplicationContext (localStorage) first
    const queryUpper = queryValue.toUpperCase();
    const queryDigits = queryValue.replace(/\D/g, "");

    const localMatches = ctxApps.filter((app) => {
      // Match by application number
      if (app.applicationNumber?.toUpperCase() === queryUpper) return true;
      // Match by national ID
      if (queryDigits.length > 0 && app.student?.nationalId === queryDigits) return true;
      // Match by phone
      if (queryDigits.length > 0 && app.student?.phone === queryDigits) return true;
      return false;
    });

    if (localMatches.length > 0) {
      const firstMatch = localMatches[0];
      const student = firstMatch.student;
      const studentName = student
        ? `${student.title || ""} ${student.firstNameTh || student.firstNameEn || ""} ${student.lastNameTh || student.lastNameEn || ""} (${student.firstNameEn || ""} ${student.lastNameEn || ""})`.trim()
        : t("unknownStudentName");

      const getStatusInfo = (status: string, remarks?: string) => {
        switch (status) {
          case "ONLINE_REGISTRATION":
            return { stepIndex: 1, labelTh: "1/13: เปิดรับสมัครออนไลน์", labelEn: "1/13: Online Registration Open" };
          case "SUBMITTED":
            return { stepIndex: 2, labelTh: "2/13: กรอกใบสมัคร + แนบเอกสาร", labelEn: "2/13: Submitted & Attached Docs" };
          case "DOCS_UNDER_REVIEW":
          case "WAITING_DOCUMENTS":
            return { stepIndex: 3, labelTh: "3/13: ตรวจเอกสารเบื้องต้น", labelEn: "3/13: Document Review in Progress" };
          case "DOCS_PASSED":
          case "DOCUMENT_VERIFIED":
            return { stepIndex: 4, labelTh: "4/13: ผ่านการตรวจเอกสาร", labelEn: "4/13: Documents Review Passed" };
          case "APPLICATION_FEE_PAID":
            return { stepIndex: 5, labelTh: "5/13: ชำระค่าสมัคร 1,800 บาท", labelEn: "5/13: App Fee Paid (1,800 THB)" };
          case "PAID":
          case "PAYMENT_PENDING":
          case "PAYMENT_VERIFIED":
          case "OPEN_HOUSE_ATTENDED":
            return { stepIndex: 6, labelTh: "6/13: เข้าร่วม Open House", labelEn: "6/13: Attended Open House" };
          case "PHYSICAL_DOCS_SUBMITTED":
            return { stepIndex: 7, labelTh: "7/13: ส่งเอกสารตัวจริงให้เจ้าหน้าที่เรียบร้อยแล้ว", labelEn: "7/13: Physical Documents Submitted" };
          case "WRITTEN_EXAM":
            return { stepIndex: 8, labelTh: "8/13: กำหนดวันสอบข้อเขียน", labelEn: "8/13: Written Exam Scheduled" };
          case "WRITTEN_EXAM_PASSED":
            return { stepIndex: 9, labelTh: "9/13: ผ่านการสอบข้อเขียน", labelEn: "9/13: Written Exam Passed" };
          case "INTERVIEW_SCHEDULED":
            return { stepIndex: 10, labelTh: "10/13: กำหนดวันสอบสัมภาษณ์", labelEn: "10/13: Interview Scheduled" };
          case "INTERVIEW_PASSED":
            return { stepIndex: 11, labelTh: "11/13: ผ่านการสอบสัมภาษณ์", labelEn: "11/13: Interview Passed" };
          case "MEDICAL_CHECK_CLASS_1":
            return { stepIndex: 12, labelTh: "12/13: เข้ารับการตรวจสุขภาพ Class 1 เวชศาสตร์การบิน", labelEn: "12/13: Class 1 Medical Check" };
          case "ACCEPTANCE_CONFIRMED":
          case "ACCEPTED":
          case "CONTRACT_SIGNED":
          case "TUITION_FIRST_INSTALLMENT_PAID":
          case "ORIENTATION":
          case "PILOT_JOURNEY_BEGUN":
          case "ENROLLED":
            return { stepIndex: 13, labelTh: "13/13: ยืนยันสิทธิ์เข้าศึกษาสำเร็จ", labelEn: "13/13: Acceptance Confirmed" };
          case "REJECTED":
            if (remarks?.includes("สัมภาษณ์") || remarks?.includes("Interview")) {
              return { stepIndex: 11, labelTh: "11/13: ประกาศผลสัมภาษณ์ (ขอขอบพระคุณที่เข้าร่วมการคัดเลือก)", labelEn: "11/13: Panel Interview Results" };
            }
            if (remarks?.includes("ขอบพระคุณ") || remarks?.includes("กำลังใจ") || remarks?.includes("เกณฑ์") || remarks?.includes("สอบ")) {
              return { stepIndex: 9, labelTh: "9/13: ประกาศผลสอบ (ขอขอบพระคุณที่เข้าร่วมการคัดเลือก)", labelEn: "9/13: Written Exam Results" };
            }
            return { stepIndex: 0, labelTh: "ไม่ผ่านการคัดเลือก (Rejected)", labelEn: "Application Not Successful" };
          default:
            return { stepIndex: 1, labelTh: "ยื่นใบสมัครแล้ว", labelEn: "Application Submitted" };
        }
      };

      const applications: ApplicationData[] = localMatches.map((app) => {
        const info = getStatusInfo(app.status, app.remarks);
        return {
          id: app.id,
          applicationNumber: app.applicationNumber,
          courseName: t("trackCourseName"),
          status: app.status,
          statusLabelTh: info.labelTh,
          statusLabelEn: info.labelEn,
          submissionDate: app.createdAt ? new Date(app.createdAt).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          stepIndex: info.stepIndex,
          remarks: t("staffProcessingProgress"),
          updatedAt: app.updatedAt ? new Date(app.updatedAt).toLocaleString(language === "en" ? "en-US" : "th-TH") : t("lastUpdatedToday"),
          joinOpenHouse: app.joinOpenHouse,
          documents: (app.documents || []).map((doc: any) => ({
            id: doc.id || `doc_${Date.now()}`,
            type: doc.type,
            secureUrl: doc.secureUrl || "",
            originalName: doc.originalName || doc.type,
            isVerified: doc.isVerified || false,
            isRejected: doc.isRejected || false,
            rejectReason: doc.rejectReason,
          })),
        };
      });

      setResult({
        found: true,
        studentName,
        nationalId: student?.nationalId || queryDigits || "-",
        applications,
      });
      setLoading(false);
      return;
    }

    // 2. Fallback: call API (for DB-backed data)
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: queryValue, nationalId: queryValue }),
      });

      const data = await res.json();

      if (!res.ok && !data.found) {
        setErrorMsg(data.error || t("trackNotFoundErr"));
        setResult(null);
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setErrorMsg(t("trackConnErr"));
    } finally {
      setLoading(false);
    }
  };

  // Live Real-Time Auto Sync: Listen to Admin updates in ApplicationContext & sync Track view instantly
  React.useEffect(() => {
    if (!result || !result.applications || result.applications.length === 0) return;

    const getStatusInfo = (status: string, remarks?: string) => {
      switch (status) {
        case "ONLINE_REGISTRATION": return { stepIndex: 1, labelTh: "1/13: เปิดรับสมัครออนไลน์", labelEn: "1/13: Online Registration Open" };
        case "SUBMITTED": return { stepIndex: 2, labelTh: "2/13: กรอกใบสมัคร + แนบเอกสาร", labelEn: "2/13: Submitted & Attached Docs" };
        case "DOCS_UNDER_REVIEW":
        case "WAITING_DOCUMENTS": return { stepIndex: 3, labelTh: "3/13: ตรวจเอกสารเบื้องต้น", labelEn: "3/13: Document Review in Progress" };
        case "DOCS_PASSED":
        case "DOCUMENT_VERIFIED": return { stepIndex: 4, labelTh: "4/13: ผ่านการตรวจเอกสาร", labelEn: "4/13: Documents Review Passed" };
        case "APPLICATION_FEE_PAID": return { stepIndex: 5, labelTh: "5/13: ชำระค่าสมัคร 1,800 บาท", labelEn: "5/13: App Fee Paid (1,800 THB)" };
        case "PAID":
        case "PAYMENT_PENDING":
        case "PAYMENT_VERIFIED":
        case "OPEN_HOUSE_ATTENDED": return { stepIndex: 6, labelTh: "6/13: เข้าร่วม Open House", labelEn: "6/13: Attended Open House" };
        case "PHYSICAL_DOCS_SUBMITTED": return { stepIndex: 7, labelTh: "7/13: ส่งเอกสารตัวจริงให้เจ้าหน้าที่เรียบร้อยแล้ว", labelEn: "7/13: Physical Documents Submitted" };
        case "WRITTEN_EXAM": return { stepIndex: 8, labelTh: "8/13: กำหนดวันสอบข้อเขียน", labelEn: "8/13: Written Exam Scheduled" };
        case "WRITTEN_EXAM_PASSED": return { stepIndex: 9, labelTh: "9/13: ผ่านการสอบข้อเขียน", labelEn: "9/13: Written Exam Passed" };
        case "INTERVIEW_SCHEDULED": return { stepIndex: 10, labelTh: "10/13: กำหนดวันสอบสัมภาษณ์", labelEn: "10/13: Interview Scheduled" };
        case "INTERVIEW_PASSED": return { stepIndex: 11, labelTh: "11/13: ผ่านการสอบสัมภาษณ์", labelEn: "11/13: Interview Passed" };
        case "MEDICAL_CHECK_CLASS_1": return { stepIndex: 12, labelTh: "12/13: เข้ารับการตรวจสุขภาพ Class 1 เวชศาสตร์การบิน", labelEn: "12/13: Class 1 Medical Check" };
        case "ACCEPTANCE_CONFIRMED":
        case "ACCEPTED":
        case "CONTRACT_SIGNED":
        case "TUITION_FIRST_INSTALLMENT_PAID":
        case "ORIENTATION":
        case "PILOT_JOURNEY_BEGUN":
        case "ENROLLED": return { stepIndex: 13, labelTh: "13/13: ยืนยันสิทธิ์เข้าศึกษาสำเร็จ", labelEn: "13/13: Acceptance Confirmed" };
        case "REJECTED":
          if (remarks?.includes("สัมภาษณ์") || remarks?.includes("Interview")) {
            return { stepIndex: 11, labelTh: "11/13: ประกาศผลสัมภาษณ์ (ขอขอบพระคุณที่เข้าร่วมการคัดเลือก)", labelEn: "11/13: Panel Interview Results" };
          }
          if (remarks?.includes("ขอบพระคุณ") || remarks?.includes("กำลังใจ") || remarks?.includes("เกณฑ์") || remarks?.includes("สอบ")) {
            return { stepIndex: 9, labelTh: "9/13: ประกาศผลสอบ (ขอขอบพระคุณที่เข้าร่วมการคัดเลือก)", labelEn: "9/13: Written Exam Results" };
          }
          return { stepIndex: 0, labelTh: "ไม่ผ่านการคัดเลือก (Rejected)", labelEn: "Application Not Successful" };
        default: return { stepIndex: 1, labelTh: "ยื่นใบสมัครแล้ว", labelEn: "Application Submitted" };
      }
    };

    const updatedApps = result.applications.map((resApp) => {
      const liveApp = ctxApps.find(
        (a) => a.id === resApp.id || a.applicationNumber === resApp.applicationNumber
      );
      if (!liveApp) return resApp;

      const info = getStatusInfo(liveApp.status, liveApp.remarks);

      let latestRemarks = liveApp.remarks || (liveApp.adminNotes && liveApp.adminNotes.length > 0 ? liveApp.adminNotes[0].content : resApp.remarks);

      return {
        ...resApp,
        status: liveApp.status,
        statusLabelTh: info.labelTh,
        statusLabelEn: info.labelEn,
        stepIndex: info.stepIndex,
        remarks: latestRemarks,
        updatedAt: liveApp.updatedAt ? new Date(liveApp.updatedAt).toLocaleString("th-TH") : resApp.updatedAt,
        documents: (liveApp.documents || []).map((doc: any) => ({
          id: doc.id || `doc_${Date.now()}`,
          type: doc.type,
          secureUrl: doc.secureUrl || "",
          originalName: doc.originalName || doc.type,
          isVerified: doc.isVerified || false,
          isRejected: doc.isRejected || false,
          rejectReason: doc.rejectReason,
        })),
      };
    });

    const isDifferent = JSON.stringify(updatedApps) !== JSON.stringify(result.applications);
    if (isDifferent) {
      setResult({
        ...result,
        applications: updatedApps,
      });
    }
  }, [ctxApps, result]);


  const steps = [
    { icon: CheckCircle2, label: t("step1Label"), subLabel: t("step1SubLabel") },
    { icon: FileText, label: t("step2Label"), subLabel: t("step2SubLabel") },
    { icon: PenTool, label: t("step3Label"), subLabel: t("step3SubLabel") },
    { icon: User, label: t("step4Label"), subLabel: t("step4SubLabel") },
    { icon: Award, label: t("step5Label"), subLabel: t("step5SubLabel") },
  ];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f5f5f5]">
      {/* ================================================================ */}
      {/* HEADER — Editorial style with gold accent                        */}
      {/* ================================================================ */}
      <section className="relative pt-24 pb-16 lg:pt-28 lg:pb-20 overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-50/50 via-[#f5f5f5] to-[#f5f5f5] z-0 pointer-events-none" />

        {/* Decorative grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a06_1px,transparent_1px),linear-gradient(to_bottom,#0f172a06_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 w-full text-center space-y-5">
          <div className="flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-tif-gold/40" />
            <span className="text-xs font-bold tracking-[0.2em] text-tif-gold uppercase">
              {t("trackBadge")}
            </span>
            <span className="h-px w-12 bg-tif-gold/40" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-tif-navy font-display tracking-tight leading-tight">
            {t("trackPageTitle")}
          </h1>
          <p className="text-slate-500 text-sm sm:text-base font-light leading-relaxed max-w-xl mx-auto">
            {t("trackPageSub")}
          </p>
        </div>
      </section>

      {/* ================================================================ */}
      {/* SEARCH CARD — Minimal white card                                  */}
      {/* ================================================================ */}
      <section className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 w-full -mt-6 relative z-20">
        <div className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-8 shadow-luxury space-y-5">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="nationalId"
                className="text-xs font-bold uppercase tracking-wider text-tif-navy flex items-center"
              >
                <Search className="h-3 w-3 mr-1.5 text-tif-gold" />
                {t("inputSearchLabel")}
              </label>
              <input
                id="nationalId"
                type="text"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder={t("inputSearchPlaceholder")}
                className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-tif-gold focus:ring-2 focus:ring-tif-gold/20 transition-all font-medium"
              />
            </div>

            {errorMsg && (
              <div className="flex items-start space-x-2.5 p-4 rounded-xl text-xs font-medium border border-rose-200 bg-rose-50 text-rose-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-500 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                disabled={loading}
                variant="gold"
                size="lg"
                className="w-full font-bold shadow-gold"
              >
                {loading ? (
                  <span className="flex items-center space-x-2 justify-center">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t("searchingBtn")}</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <Search className="h-4 w-4" />
                    <span>{t("searchStatusBtn")}</span>
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* ================================================================ */}
      {/* TRACKING RESULTS                                                  */}
      {/* ================================================================ */}
      {result && result.found && result.applications && (
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 w-full mt-10 pb-24 space-y-6 animate-in fade-in duration-500">
          {/* Result Header Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-luxury">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-tif-navy flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-tif-gold" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-tif-goldDark block mb-0.5">
                    {t("applicantNameLabel")}
                  </span>
                  <h2 className="text-xl font-extrabold text-tif-navy font-display">
                    {result.studentName}
                  </h2>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-right">
                <span className="text-[10px] block uppercase font-bold tracking-wider text-slate-400">
                  {t("nationalIdLabel")}
                </span>
                <span className="text-sm font-mono font-bold text-tif-navy">
                  {result.nationalId}
                </span>
              </div>
            </div>
          </div>

          {/* Application Cards */}
          {result.applications.map((app) => (
            <div
              key={app.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-luxury space-y-7"
            >
              {/* Course & Application Ref Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full border border-tif-gold/30 bg-tif-gold/5 text-tif-goldDark">
                    <FileText className="h-3.5 w-3.5" />
                    <span>{app.applicationNumber}</span>
                  </div>
                  <h3 className="text-lg font-bold text-tif-navy font-display">
                    {app.courseName}
                  </h3>
                </div>

                <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Calendar className="h-4 w-4 text-tif-gold" />
                  <span>{t("submittedDateLabel")} {app.submissionDate}</span>
                </div>
              </div>

              {/* 13 Pilot Workflow Steps Timeline */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold tracking-[0.15em] text-tif-gold uppercase">
                      {t("progressLabel")} ({t("workflow13StepsSubtitle")})
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shrink-0">
                    {t("currentStepProgress")} {app.stepIndex || 1} {t("ofSteps")} 13 ({Math.round(((app.stepIndex || 1) / 13) * 100)}%)
                  </span>
                </div>

                {/* Progress bar line */}
                <div className="relative pt-1 pb-2">
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="bg-gradient-to-r from-emerald-500 via-amber-400 to-tif-gold h-full transition-all duration-500 rounded-full"
                      style={{
                        width: `${Math.min(100, Math.max(7, ((app.stepIndex || 1) / 13) * 100))}%`,
                      }}
                    />
                  </div>
                </div>

                {/* 13 Milestone Cards Responsive Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 xl:grid-cols-13 gap-2">
                  {PILOT_WORKFLOW_STEPS.map((stepDef) => {
                    const curStep = app.stepIndex || 1;
                    const isComplete = curStep > stepDef.step;
                    const isCurrent = curStep === stepDef.step;
                    const isFeeStep = stepDef.step === 5;

                    const getStepIcon = (s: number) => {
                      switch (s) {
                        case 1: return Globe;
                        case 2: return Upload;
                        case 3: return Clock;
                        case 4: return CheckCircle2;
                        case 5: return CreditCard;
                        case 6: return Sparkles;
                        case 7: return FileText;
                        case 8: return PenTool;
                        case 9: return CheckCircle2;
                        case 10: return User;
                        case 11: return CheckCircle2;
                        case 12: return Award;
                        case 13: return Sparkles;
                        default: return CheckCircle2;
                      }
                    };

                    const StepIcon = getStepIcon(stepDef.step);

                    return (
                      <div
                        key={stepDef.step}
                        className={`flex flex-col items-center text-center p-2 rounded-xl border transition-all ${
                          isCurrent
                            ? isFeeStep
                              ? "bg-amber-50 border-amber-400 text-amber-900 shadow-md ring-2 ring-amber-400/30"
                              : "bg-tif-gold/15 border-tif-gold text-tif-navy shadow-md ring-2 ring-tif-gold/30"
                            : isComplete
                            ? "bg-emerald-50/70 border-emerald-300 text-emerald-900"
                            : "bg-white border-slate-200 text-slate-400"
                        }`}
                      >
                        {/* Step Number Badge */}
                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md mb-1 ${
                            isCurrent
                              ? "bg-tif-gold text-slate-950 font-extrabold"
                              : isComplete
                              ? "bg-emerald-200 text-emerald-900 font-bold"
                              : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          #{stepDef.step}
                        </span>

                        <div
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border transition-all mb-1 ${
                            isComplete
                              ? "bg-emerald-500 border-emerald-500 text-white shadow-xs"
                              : isCurrent
                              ? isFeeStep
                                ? "bg-amber-500 border-amber-500 text-white font-bold animate-pulse shadow-md"
                                : "bg-tif-gold border-tif-gold text-slate-950 font-bold animate-pulse shadow-md"
                              : "bg-slate-50 border-slate-200 text-slate-300"
                          }`}
                        >
                          <StepIcon className="h-3.5 w-3.5" />
                        </div>

                        <p
                          className={`text-[10px] font-bold leading-tight line-clamp-2 ${
                            isCurrent
                              ? isFeeStep
                                ? "text-amber-900 font-extrabold"
                                : "text-tif-goldDark font-bold"
                              : isComplete
                              ? "text-slate-800"
                              : "text-slate-400"
                          }`}
                        >
                          {language === "en" ? stepDef.titleEn : stepDef.titleTh}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Status Detail & Remarks */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-7 space-y-6 shadow-luxury">
                {/* Header Metadata Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-tif-gold animate-pulse" />
                    {t("currentStatusLabel")}
                  </span>
                  <span className="text-xs font-medium text-slate-400 font-mono flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {t("lastUpdatedLabel")}: <span className="text-slate-700 font-semibold">{app.updatedAt}</span>
                  </span>
                </div>

                {/* Main Status Title */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tif-navy to-slate-900 text-tif-gold flex items-center justify-center shrink-0 shadow-sm border border-tif-gold/20 mt-0.5">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-extrabold text-tif-navy font-display tracking-tight leading-snug">
                      {language === "th" ? app.statusLabelTh : app.statusLabelEn}
                    </h3>
                    <span className="inline-block text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                      Step {app.stepIndex || 1} / 13
                    </span>
                  </div>
                </div>

                {/* Staff Remarks Box */}
                <div className="relative rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50/80 via-amber-50/40 to-white p-5 space-y-2.5 shadow-2xs border-l-4 border-l-tif-gold">
                  <div className="flex items-center gap-2 text-tif-navy font-bold text-xs uppercase tracking-wider">
                    <MessageSquare className="h-4 w-4 text-tif-gold shrink-0" />
                    <span>{t("staffRemarksLabel")}</span>
                  </div>
                  <div className="text-sm font-medium text-slate-800 leading-relaxed font-sans pl-0.5">
                    {formatRemarks(app.remarks, app.stepIndex, language)}
                  </div>

                  {/* Document Re-upload Warning */}
                  {(app.status === "WAITING_DOCUMENTS" || app.documents?.some((d) => d.isRejected)) && (
                    <div className="mt-3 p-4 rounded-xl border border-rose-200 bg-rose-50 space-y-3">
                      <div className="flex items-center gap-2 text-rose-700 font-bold text-xs border-b border-rose-200 pb-2.5">
                        <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
                        <span>{t("docReuploadRequiredTitle")}</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        {app.documents?.filter((d) => d.isRejected)?.map((doc) => {
                          const label = getDocTypeLabel(doc.type, t);

                          return (
                            <div
                              key={doc.id}
                              className="p-3 bg-white rounded-lg border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-rose-700 text-xs flex items-center">
                                    ❌ {label}
                                  </span>
                                  <span className="text-slate-400 font-mono text-[11px] truncate">({doc.originalName})</span>
                                </div>
                                {doc.rejectReason && (
                                  <p className="text-rose-600 text-[11px] bg-rose-50 p-2 rounded border border-rose-200 leading-tight">
                                    <strong>{t("reuploadReasonLabel")}</strong> {doc.rejectReason}
                                  </p>
                                )}
                              </div>

                              <Button
                                size="sm"
                                variant="gold"
                                onClick={() => handleOpenReuploadModal(app.applicationNumber, doc)}
                                className="font-bold text-xs shrink-0"
                              >
                                <Upload className="mr-1 h-3.5 w-3.5" /> {t("reuploadThisFileBtn")}
                              </Button>
                            </div>
                          );
                        })}

                        {(!app.documents || app.documents.filter((d) => d.isRejected).length === 0) && (
                          <div className="p-3 bg-white rounded-lg border border-rose-200 flex items-center justify-between">
                            <span className="text-slate-600">{t("attachNewFilePrompt")}</span>
                            <Button
                              size="sm"
                              variant="gold"
                              onClick={() => handleOpenReuploadModal(app.applicationNumber)}
                              className="font-bold text-xs shrink-0"
                            >
                              <Upload className="mr-1 h-3.5 w-3.5" /> {t("attachNewFileBtn")}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Dynamic Step Guidance & Condition Met Card */}
                {(() => {
                  const guidance = getStepGuidance(app, language);
                  const IconComp = guidance.icon;

                  return (
                    <div className="rounded-2xl border border-slate-200/90 bg-slate-50/80 p-5 sm:p-6 space-y-4 shadow-2xs">
                      {/* Condition Badge & Progress Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/70 pb-3.5">
                        <span className={`text-xs font-bold px-3.5 py-1.5 rounded-full border ${guidance.badgeBg} flex items-center gap-2 w-fit shadow-2xs`}>
                          <IconComp className="h-4 w-4 shrink-0" />
                          {guidance.condition}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                          <span>{t("currentStepLabel")}:</span>
                          <span className="font-mono font-extrabold text-tif-navy bg-white px-2.5 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                            {app.stepIndex || 1} / 13
                          </span>
                        </div>
                      </div>

                      {/* Guidance Title & Description */}
                      <div className="space-y-1.5 pt-0.5">
                        <h5 className="text-sm font-bold text-tif-navy font-display flex items-center gap-2">
                          {guidance.title}
                        </h5>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                          {guidance.description}
                        </p>
                      </div>

                      {/* Pinned Action Box */}
                      <div className="rounded-xl bg-white border border-amber-200/90 p-4 sm:p-5 space-y-2.5 shadow-2xs relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/5 rounded-full blur-xl pointer-events-none" />
                        <span className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="text-base">📌</span> {guidance.nextActionTitle}
                        </span>
                        <p className="text-xs sm:text-sm text-slate-900 font-bold leading-relaxed">
                          {guidance.nextAction}
                        </p>

                        {(guidance.actionType === "PAY" || guidance.actionType === "SLIP_SUBMITTED" || (app.stepIndex === 5 && app.status !== "PAYMENT_PENDING")) && (() => {
                          const isSubmitted = guidance.actionType === "SLIP_SUBMITTED" || app.status === "PAYMENT_PENDING" || app.remarks?.includes("สลิป") || app.remarks?.includes("Slip") || app.remarks?.includes("โอนเงิน");

                          return (
                            <div className={`pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t mt-3 p-3.5 rounded-xl border ${
                              isSubmitted
                                ? "bg-emerald-50/90 border-emerald-300 text-emerald-950"
                                : "bg-amber-50/70 border-amber-300 text-amber-950"
                            }`}>
                              <span className="text-xs font-bold flex items-center gap-1.5">
                                {isSubmitted
                                  ? t("paymentSlipSubmittedPrompt")
                                  : t("paymentSlipInstructionPrompt")}
                              </span>
                              <Button
                                size="sm"
                                variant={isSubmitted ? "outline" : "gold"}
                                onClick={() => handleOpenPayModal(app.applicationNumber)}
                                className={`font-bold text-xs shrink-0 py-2.5 px-4 ${
                                  isSubmitted
                                    ? "border-emerald-400 text-emerald-950 hover:bg-emerald-100 bg-white shadow-xs"
                                    : "shadow-gold"
                                }`}
                              >
                                {isSubmitted ? (
                                  <>
                                    <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-600" />
                                    {t("slipSubmittedBtn")}
                                  </>
                                ) : (
                                  <>
                                    <CreditCard className="mr-1.5 h-4 w-4" />
                                    {t("attachPaymentSlipBtn")}
                                  </>
                                )}
                              </Button>
                            </div>
                          );
                        })()}

                        {guidance.actionType === "EXAM" && (
                          <div className="mt-3 p-3.5 rounded-xl bg-purple-950/5 border border-purple-200 space-y-2">
                            <div className="flex items-center gap-1.5 font-bold text-purple-950 text-xs border-b border-purple-200/60 pb-2">
                              <Calendar className="h-4 w-4 text-purple-600 shrink-0" />
                              <span>{t("writtenExamDetailsTitle")}</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-medium">
                              <div className="bg-white p-2.5 rounded-lg border border-purple-100 shadow-xs space-y-0.5">
                                <span className="text-[10px] text-slate-400 font-bold block">{t("writtenExamDateLabel")}</span>
                                <span className="font-bold text-slate-900 text-xs">{t("writtenExamDateValue")}</span>
                              </div>
                              <div className="bg-white p-2.5 rounded-lg border border-purple-100 shadow-xs space-y-0.5">
                                <span className="text-[10px] text-slate-400 font-bold block">{t("writtenExamTimeLabel")}</span>
                                <span className="font-bold text-slate-900 text-xs">{t("writtenExamTimeValue")}</span>
                                <span className="text-[9px] font-medium text-purple-700 block">{t("writtenExamTimeNotice")}</span>
                              </div>
                              <div className="bg-white p-2.5 rounded-lg border border-purple-100 shadow-xs space-y-0.5">
                                <span className="text-[10px] text-slate-400 font-bold block">{t("writtenExamLocationLabel")}</span>
                                <span className="font-bold text-purple-950 text-xs">{t("writtenExamLocationValue")}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Submitted Documents Section — Completely hidden once Step 4 (Document Review) is passed */}
              {(() => {
                const docs = app.documents || [];
                const rejectedDocs = docs.filter((d) => d.isRejected);
                const isStep4OrNext =
                  (app.stepIndex || 1) >= 4 ||
                  app.status === "DOCS_PASSED" ||
                  app.status === "DOCUMENT_VERIFIED" ||
                  app.status === "APPLICATION_FEE_PAID" ||
                  app.status === "PAID" ||
                  app.status === "PAYMENT_PENDING" ||
                  app.status === "PAYMENT_VERIFIED" ||
                  app.status === "OPEN_HOUSE_ATTENDED" ||
                  app.status === "PHYSICAL_DOCS_SUBMITTED" ||
                  app.status === "WRITTEN_EXAM" ||
                  app.status === "WRITTEN_EXAM_PASSED" ||
                  app.status === "INTERVIEW_SCHEDULED" ||
                  app.status === "INTERVIEW_PASSED" ||
                  app.status === "MEDICAL_CHECK_CLASS_1" ||
                  app.status === "ACCEPTANCE_CONFIRMED";

                // Step 4 passed & subsequent steps: Hide attached documents section completely if no rejected docs
                if (isStep4OrNext && rejectedDocs.length === 0) {
                  return null;
                }
                const isAllUploadedAndClean = docs.length >= 6 && rejectedDocs.length === 0;
                const showAll = showAllDocsMap[app.id] || false;
                const isDocLocked =
                  app.status !== "SUBMITTED" &&
                  app.status !== "REGISTERED" &&
                  app.status !== "DOCS_PENDING" &&
                  app.status !== "REJECTED";

                // Always display all attached document cards directly
                const displayedDocs = docs;

                return (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-tif-gold" />
                        <div>
                          <h4 className="text-xs font-bold text-tif-navy uppercase tracking-wider font-display">
                            {rejectedDocs.length > 0
                              ? `${t("rejectedDocsActionRequiredTitle")} (${rejectedDocs.length})`
                              : t("attachedDocsTitle")}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {rejectedDocs.length > 0
                              ? t("showRejectedDocsOnlyDesc")
                              : t("attachedDocsSub")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Lock editing & adding docs if status passed document verification */}
                        {isDocLocked ? (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/90 px-3 py-1.5 rounded-xl border border-emerald-300 flex items-center shadow-sm">
                            <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                            {t("docsVerifiedLockedBadge")}
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenReuploadModal(app.applicationNumber)}
                            className="text-xs font-bold shrink-0 border-tif-navy/20 text-tif-navy hover:bg-tif-navy hover:text-white"
                          >
                            <Upload className="mr-1 h-3.5 w-3.5" /> {t("addMoreDocsBtn")}
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {displayedDocs && displayedDocs.length > 0 ? (
                        displayedDocs.map((doc) => {
                          const label = getDocTypeLabel(doc.type, t);
                          const isDocVerified = doc.isVerified || (isDocLocked && !doc.isRejected);
                          const isSingleDocLocked = isDocLocked || (isDocVerified && !doc.isRejected);

                          return (
                            <div
                              key={doc.id}
                              className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 transition-all ${
                                doc.isRejected
                                  ? "border-rose-200 bg-rose-50"
                                  : isDocVerified
                                  ? "border-emerald-200 bg-emerald-50/50"
                                  : "border-slate-200 bg-slate-50"
                              }`}
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-tif-navy text-xs">{label}</span>
                                  {doc.isRejected ? (
                                    <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded flex items-center border border-rose-200">
                                      {t("statusReupload")}
                                    </span>
                                  ) : isDocVerified ? (
                                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded flex items-center border border-emerald-200">
                                      <CheckCircle2 className="mr-1 h-3 w-3" /> {t("statusApproved")}
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded flex items-center border border-amber-200">
                                      <Clock className="mr-1 h-3 w-3" /> {t("statusPending")}
                                    </span>
                                  )}
                                </div>

                                <p className="text-[11px] text-slate-400 font-mono truncate">{doc.originalName}</p>

                                {doc.isRejected && doc.rejectReason && (
                                  <div className="p-2 rounded bg-rose-100 border border-rose-200 text-[10px] text-rose-700 leading-tight">
                                    <strong>{t("rejectionReasonLabel")}</strong> {doc.rejectReason}
                                  </div>
                                )}
                              </div>

                              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                                <a
                                  href={doc.secureUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] text-tif-goldDark hover:text-tif-gold hover:underline font-semibold"
                                >
                                  {t("viewUploadedFileBtn")}
                                </a>

                                {/* Only show Change File / Reupload if doc is NOT locked and NOT verified */}
                                {!isSingleDocLocked && (
                                  <Button
                                    size="sm"
                                    variant={doc.isRejected ? "gold" : "outline"}
                                    onClick={() => handleOpenReuploadModal(app.applicationNumber, doc)}
                                    className={`text-[10px] px-2.5 py-1 rounded-lg font-bold ${
                                      doc.isRejected
                                        ? ""
                                        : "border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-tif-navy"
                                    }`}
                                  >
                                    <Upload className="mr-1 h-3 w-3" /> {doc.isRejected ? t("reuploadSubmitBtn") : t("changeFileBtn")}
                                  </Button>
                                )}
                                {isSingleDocLocked && !doc.isRejected && (
                                  <span className="text-[10px] font-medium text-slate-400 italic">
                                    {t("docVerifiedBadgeLabel")}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="col-span-1 sm:col-span-2 p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200 text-slate-400 text-xs">
                          {t("noDocsFoundMsg")}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          ))}
        </section>
      )}

      {/* ================================================================ */}
      {/* PAYMENT SLIP MODAL                                                */}
      {/* ================================================================ */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title={`${t("payModalTitle")} (${activePayAppNum})`}
        description={t("payModalDesc")}
        maxWidth="md"
        variant="light"
      >
        {slipSuccess ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 text-center space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
            <h4 className="text-base font-bold text-emerald-950">{t("slipUploadSuccessTitle")}</h4>
            <p className="text-xs text-emerald-700">
              {t("slipUploadSuccessDesc")} (<strong className="font-mono">{activePayAppNum}</strong>)
            </p>
            <Button variant="gold" size="sm" onClick={() => setPayModalOpen(false)}>
              {t("closeModalBtn")}
            </Button>
          </div>
        ) : (
          <div className="space-y-2.5 text-xs text-slate-700">
            {/* Bank Info (SCB Single Ultra-Compact Card) */}
            <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-900 text-white p-3 rounded-xl border border-purple-800 shadow-xs flex items-center justify-between gap-2">
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-white truncate">{t("scbBankName")}</span>
                  <span className="text-[9px] text-purple-200 bg-purple-800/70 px-1.5 py-0.2 rounded font-medium shrink-0">
                    {t("savingsAccountType")}
                  </span>
                </div>
                <p className="text-slate-300 text-[10px] truncate">{t("scbAccountOwner")}</p>
              </div>

              <div className="bg-purple-900/90 border border-purple-700/80 px-2.5 py-1 rounded-lg text-right shrink-0">
                <div className="text-sm font-extrabold font-mono text-tif-gold tracking-wider">202-280661-2</div>
                <div className="text-[9px] font-mono text-purple-200 font-bold">{t("amountToPayLabel")}</div>
              </div>
            </div>

            {/* Open House Registration (Horizontal Compact Choice) */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-tif-navy uppercase tracking-wider block font-display">
                  📋 {t("openHouseRegistrationHeader")}
                </span>
                <span className="text-[10px] text-amber-700 font-medium">
                  {t("openHouseLimitNotice")}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Radio 1: YES */}
                <label className={`flex items-center space-x-2 p-2.5 rounded-lg border transition cursor-pointer ${
                  joinOpenHouse === true 
                    ? "border-tif-gold bg-amber-50/80 ring-1 ring-tif-gold/40 shadow-xs" 
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}>
                  <input
                    type="radio"
                    name="openHouseChoiceTrack"
                    checked={joinOpenHouse === true}
                    onChange={() => setJoinOpenHouse(true)}
                    className="w-4 h-4 text-tif-gold focus:ring-tif-gold accent-tif-gold shrink-0 cursor-pointer"
                  />
                  <span className="text-[11px] font-bold text-slate-900 leading-snug">
                    {t("openHouseChoiceYes")}
                  </span>
                </label>

                {/* Radio 2: NO */}
                <label className={`flex items-center space-x-2 p-2.5 rounded-lg border transition cursor-pointer ${
                  joinOpenHouse === false 
                    ? "border-tif-gold bg-amber-50/80 ring-1 ring-tif-gold/40 shadow-xs" 
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}>
                  <input
                    type="radio"
                    name="openHouseChoiceTrack"
                    checked={joinOpenHouse === false}
                    onChange={() => setJoinOpenHouse(false)}
                    className="w-4 h-4 text-tif-gold focus:ring-tif-gold accent-tif-gold shrink-0 cursor-pointer"
                  />
                  <span className="text-[11px] font-bold text-slate-800 leading-snug">
                    {t("openHouseChoiceNo")}
                  </span>
                </label>
              </div>

              {/* Minimal Event Summary when YES */}
              {joinOpenHouse && (
                <div className="p-2 rounded-lg bg-white border border-amber-200 text-[10px] text-slate-700 flex flex-wrap items-center justify-between gap-1 shadow-2xs">
                  <span>📅 12 Sep 2026 (09:00 - 15:00 น.)</span>
                  <a
                    href="https://maps.app.goo.gl/Dou74zVtK9MWUbW18"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-tif-navy hover:text-tif-gold underline flex items-center gap-0.5"
                  >
                    📍 Best Western Chaengwattana <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Upload Input Box */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <label className="font-bold text-tif-navy block text-[11px]">
                📎 {t("selectSlipFileLabel")} *
              </label>
              
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={async (e) => {
                  let selected = e.target.files?.[0];
                  if (!selected) return;

                  if (selected.size > 5 * 1024 * 1024 && selected.type.startsWith("image/")) {
                    selected = await compressImageIfNeeded(selected, 5 * 1024 * 1024);
                  }

                  if (selected && selected.size > 5 * 1024 * 1024) {
                    alert(t("fileTooLargeSlipAlert"));
                    e.target.value = "";
                    setSlipFile(null);
                    return;
                  }
                  setSlipFile(selected || null);
                }}
                className="w-full text-[11px] text-slate-700 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-tif-navy file:text-white hover:file:bg-tif-navyDark cursor-pointer bg-white p-1 rounded-lg border border-slate-200"
              />

              <span className="text-[10px] text-slate-500 block">{t("autoCompressHint")}</span>
              
              {slipFile && (
                <div className="p-1.5 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between text-[11px] text-emerald-800 font-medium">
                  <span className="flex items-center gap-1 truncate">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{slipFile.name}</span>
                  </span>
                  <span className="font-mono text-[10px] shrink-0 font-bold">({Math.round(slipFile.size / 1024)} KB)</span>
                </div>
              )}
            </div>

            <Button
              variant="gold"
              size="sm"
              className="w-full font-bold shadow-gold py-2.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleConfirmSubmitSlip}
              disabled={joinOpenHouse === null || !slipFile || uploadingSlip}
            >
              {uploadingSlip
                ? t("submittingSlipBtn")
                : joinOpenHouse === null && !slipFile
                ? t("selectOpenHouseAndSlipPrompt")
                : joinOpenHouse === null
                ? t("selectOpenHouseChoicePrompt")
                : !slipFile
                ? t("attachSlipPrompt")
                : t("confirmSubmitSlipBtn")}
            </Button>
          </div>
        )}
      </Modal>

      {/* ================================================================ */}
      {/* RE-UPLOAD DOCUMENT MODAL                                          */}
      {/* ================================================================ */}
      <Modal
        isOpen={reuploadModalOpen}
        onClose={() => setReuploadModalOpen(false)}
        title={`${t("reuploadModalTitle")} (${activePayAppNum})`}
        description={t("reuploadModalDesc")}
        maxWidth="md"
        variant="light"
      >
        <div className="space-y-3 text-xs text-slate-700">
          {/* Document Type Selector */}
          <div className="space-y-1">
            <label className="font-bold text-tif-navy block text-[11px]">{t("selectDocTypeLabel")}</label>
            <select
              value={reuploadType}
              onChange={(e) => setReuploadType(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-900 focus:border-tif-gold focus:outline-none font-medium shadow-xs"
            >
              <option value="NATIONAL_ID_CERTIFIED">{t("docNationalId")}</option>
              <option value="TRANSCRIPT_CERTIFIED">{t("docTranscript")}</option>
              <option value="HOUSE_REGISTRATION_CERTIFIED">{t("docHouseRegistration")}</option>
              <option value="MEDICAL_CERTIFICATE_CLASS_1">{t("docMedicalCert")}</option>
              <option value="PHOTO_1_INCH">{t("docPassportPhoto")}</option>
              <option value="CRIMINAL_RECORD_CHECK">{t("docOther")}</option>
              <option value="MILITARY_SERVICE_EXEMPTION">{t("docMilitary")}</option>
            </select>
          </div>

          {activeReuploadDoc?.rejectReason && (
            <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-200 space-y-0.5 text-rose-800">
              <span className="text-[9px] text-rose-600 font-bold uppercase block">{t("previousRejectReasonTitle")}</span>
              <p className="text-[11px] font-medium">{activeReuploadDoc.rejectReason}</p>
            </div>
          )}

          <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <label className="font-bold text-tif-navy block text-[11px]">{t("selectNewDocFileLabel")}</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={async (e) => {
                let selected = e.target.files?.[0];
                if (!selected) return;

                if (selected.size > 5 * 1024 * 1024 && selected.type.startsWith("image/")) {
                  selected = await compressImageIfNeeded(selected, 5 * 1024 * 1024);
                }

                if (selected && selected.size > 5 * 1024 * 1024) {
                  alert(t("fileTooLargeDocAlert"));
                  e.target.value = "";
                  setReuploadFile(null);
                  return;
                }
                setReuploadFile(selected || null);
              }}
              className="w-full text-[11px] text-slate-700 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-bold file:bg-tif-navy file:text-white hover:file:bg-tif-navyDark cursor-pointer bg-white p-1 rounded-lg border border-slate-200"
            />
            <span className="text-[10px] text-slate-500 block">{t("autoCompressHint")}</span>
            
            {reuploadFile && (
              <div className="p-1.5 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between text-[11px] text-emerald-800 font-medium">
                <span className="flex items-center gap-1 truncate">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">{reuploadFile.name}</span>
                </span>
                <span className="font-mono text-[10px] shrink-0 font-bold">({Math.round(reuploadFile.size / 1024)} KB)</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-2 pt-1">
            <Button variant="outline" size="sm" onClick={() => setReuploadModalOpen(false)}>
              {t("cancelBtn")}
            </Button>
            <Button
              variant="gold"
              size="sm"
              onClick={handleConfirmReupload}
              disabled={uploadingReupload}
              className="font-bold px-4"
            >
              {uploadingReupload ? t("uploadingDocBtn") : t("confirmUploadDocBtn")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}