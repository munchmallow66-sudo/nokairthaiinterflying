import nodemailer from "nodemailer";

const SENT_VIA_NOTE_TH =
  "อีเมลฉบับนี้จัดส่งอัตโนมัติผ่านระบบเมลของสายการบินนกแอร์ ในนามของสถาบันการบิน Thai Inter Flying";
const SENT_VIA_NOTE_EN =
  "This message was sent automatically via Nok Air's mail system on behalf of Thai Inter Flying Academy.";

// Shared transport. From stays on the SMTP account's own domain: nokair.co.th
// publishes DMARC p=quarantine, so a From that doesn't align with it is junked
// by policy. The display name carries the Nok Air half too, otherwise
// recipients read "Thai Inter Flying <...@nokair.co.th>" as a spoofed sender.
function createMailer() {
  const host = process.env.SMTP_HOST || "smtp.office365.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  // No hardcoded fallback: it keeps a leaked password alive in the bundle and
  // masks a misconfigured deploy as a working one.
  if (!user || !pass) {
    console.error("[Email System] SMTP_USER/SMTP_PASS missing - notification skipped.");
    return null;
  }

  return {
    transporter: nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: {
        ciphers: "SSLv3",
        rejectUnauthorized: false,
      },
    }),
    from: process.env.SMTP_FROM || `Thai Inter Flying x Nok Air <${user}>`,
    fromDomain: user.split("@")[1] || "nokair.co.th",
  };
}

interface SendConfirmationEmailParams {
  toEmail: string;
  studentName: string;
  applicationNumber: string;
  password: string;
  lang?: "th" | "en";
}

export async function sendApplicationConfirmationEmail({
  toEmail,
  studentName,
  applicationNumber,
  password,
  lang = "th",
}: SendConfirmationEmailParams) {
  if (!toEmail) {
    console.warn("Email notification skipped: No recipient email provided.");
    return { success: false, error: "No email provided" };
  }

  const mailer = createMailer();
  if (!mailer) {
    return { success: false, error: "SMTP credentials not configured" };
  }
  const { transporter, from, fromDomain } = mailer;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://studen-phi.vercel.app";
  const trackUrl = `${baseUrl}/track`;

  const isEn = lang === "en";

  // Clean, professional subject line without brackets to avoid trigger-happy spam filters
  const subject = isEn
    ? `Thai Inter Flying Pilot Application Confirmation - ${applicationNumber}`
    : `ยืนยันการรับใบสมัครนักบิน Thai Inter Flying - หมายเลขใบสมัคร ${applicationNumber}`;

  // Plain text fallback (Essential for preventing Junk/Spam classification in Gmail & Outlook)
  const textContent = isEn
    ? `Dear ${studentName},

Thank you for submitting your pilot cadet application with Thai Inter Flying.

Application Number: ${applicationNumber}
Tracking Passcode: ${password}

You can track your application status at: ${trackUrl}

Thai Inter Flying Academy
Tel: 02 114 3325 | Email: salemarketing@tif.ac.th

${SENT_VIA_NOTE_EN}`
    : `เรียนคุณ ${studentName},

สถาบันการบิน Thai Inter Flying ขอขอบพระคุณที่ท่านให้ความสนใจสมัครเรียนหลักสูตรนักบิน ระบบได้บันทึกข้อมูลใบสมัครของท่านเรียบร้อยแล้ว

หมายเลขใบสมัคร: ${applicationNumber}
รหัสสำหรับติดตามสถานะ: ${password}

ท่านสามารถนำหมายเลขใบสมัครและรหัสติดตามสถานะ ไปเข้าตรวจสอบสถานะได้ที่: ${trackUrl}

สถาบันการบิน Thai Inter Flying
โทรศัพท์: 02 114 3325 | อีเมล: salemarketing@tif.ac.th

${SENT_VIA_NOTE_TH}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="${lang}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin:0; padding:0; background-color:#f4f6f9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color:#1e293b;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f4f6f9; padding:40px 10px;">
        <tr>
          <td align="center">
            <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width:600px; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.08); border:1px solid #e2e8f0;">
              
              <!-- Header -->
              <tr>
                <td style="background-color:#0b132b; padding:32px 30px; text-align:center; border-bottom:4px solid #d4af37;">
                  <h1 style="color:#d4af37; margin:0 0 6px 0; font-size:24px; font-weight:800; font-family:Georgia, serif;">THAI INTER FLYING</h1>
                  <p style="color:#94a3b8; margin:0; font-size:13px; font-weight:500; letter-spacing:1px; text-transform:uppercase;">Pilot Training Academy & Online Admission</p>
                </td>
              </tr>

              <!-- Main Content Body -->
              <tr>
                <td style="padding:32px 30px;">
                  <h2 style="color:#0b132b; margin:0 0 16px 0; font-size:20px; font-weight:700;">
                    ${isEn ? `Dear ${studentName},` : `เรียนคุณ ${studentName},`}
                  </h2>
                  <p style="margin:0 0 24px 0; font-size:14px; line-height:1.6; color:#475569;">
                    ${
                      isEn
                        ? "Thank you for submitting your pilot cadet application with Thai Inter Flying. Your application has been successfully registered in our system."
                        : "สถาบันการบิน Thai Inter Flying ขอขอบพระคุณที่ท่านให้ความสนใจสมัครเรียนหลักสูตรนักบิน ระบบได้บันทึกข้อมูลใบสมัครของท่านเรียบร้อยแล้ว"
                    }
                  </p>

                  <!-- Credentials Highlight Card -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f8fafc; border:1px solid #cbd5e1; border-radius:12px; margin-bottom:24px; padding:20px;">
                    <tr>
                      <td style="padding-bottom:12px;">
                        <span style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:4px;">
                          ${isEn ? "Application Number" : "หมายเลขใบสมัคร (Application No.)"}
                        </span>
                        <span style="font-size:22px; font-weight:800; font-family:monospace; color:#0b132b;">
                          ${applicationNumber}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style="border-top:1px dashed #cbd5e1; padding-top:12px;">
                        <span style="font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px; display:block; margin-bottom:4px;">
                          ${isEn ? "Tracking Passcode" : "รหัสสำหรับติดตามสถานะ (Tracking Code)"}
                        </span>
                        <span style="font-size:22px; font-weight:800; font-family:monospace; color:#d97706;">
                          ${password}
                        </span>
                      </td>
                    </tr>
                  </table>

                  <!-- Instructions -->
                  <div style="background-color:#fffbeb; border:1px solid #fef08a; border-radius:10px; padding:16px; margin-bottom:24px;">
                    <p style="margin:0 0 8px 0; font-size:13px; font-weight:700; color:#92400e;">
                      📌 ${isEn ? "Next Steps & Tracking:" : "ขั้นตอนถัดไปและการติดตามสถานะ:"}
                    </p>
                    <ul style="margin:0; padding-left:20px; font-size:13px; color:#78350f; line-height:1.6;">
                      <li>${
                        isEn
                          ? "Admissions staff is reviewing your submitted documents."
                          : "เจ้าหน้าที่กำลังดำเนินการตรวจสอบเอกสารแนบของท่าน"
                      }</li>
                      <li>${
                        isEn
                          ? "You can track your application status at any time using your Application Number and Passcode."
                          : "ท่านสามารถนำหมายเลขใบสมัครและรหัสติดตามสถานะ ไปเข้าตรวจสอบสถานะได้ตลอดเวลาที่หน้าเว็บไซต์"
                      }</li>
                    </ul>
                  </div>

                  <!-- Call to action button -->
                  <div style="text-align:center; margin-bottom:28px;">
                    <a href="${trackUrl}" target="_blank" style="display:inline-block; background-color:#0b132b; color:#d4af37; font-size:14px; font-weight:700; text-decoration:none; padding:14px 28px; border-radius:10px; border:1px solid #d4af37;">
                      ${isEn ? "Track Application Status" : "ติดตามสถานะการสมัคร"}
                    </a>
                  </div>

                  <p style="margin:0; font-size:12px; color:#94a3b8; line-height:1.5;">
                    ${
                      isEn
                        ? "If you have any questions or need assistance, please contact our admissions department."
                        : "หากมีข้อสงสัยเพิ่มเติมหรือต้องการติดต่อเจ้าหน้าที่ สามารถติดต่อผ่านช่องทางด้านล่างนี้ได้ทันที"
                    }
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color:#f8fafc; padding:20px 30px; border-top:1px solid #e2e8f0; text-align:center;">
                  <p style="margin:0 0 4px 0; font-size:12px; font-weight:700; color:#475569;">สถาบันการบิน Thai Inter Flying</p>
                  <p style="margin:0; font-size:11px; color:#64748b; line-height:1.5;">
                    📞 โทรศัพท์: 02 114 3325 | 📧 อีเมล: salemarketing@tif.ac.th<br>
                    🌐 เว็บไซต์: www.tif.ac.th
                  </p>
                  <p style="margin:12px 0 0 0; font-size:10px; color:#94a3b8; line-height:1.5; border-top:1px solid #e2e8f0; padding-top:10px;">
                    ${isEn ? SENT_VIA_NOTE_EN : SENT_VIA_NOTE_TH}
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from,
      replyTo: "salemarketing@tif.ac.th",
      to: toEmail,
      subject,
      text: textContent,
      html: htmlContent,
      // Pinned to the sending domain. Left alone, nodemailer builds this from
      // os.hostname(), which on serverless is a throwaway container id that
      // resolves nowhere - a Message-ID domain that doesn't exist scores as spam.
      messageId: `<${applicationNumber}.${Date.now()}@${fromDomain}>`,
      headers: {
        "Auto-Submitted": "auto-generated",
        "X-Auto-Response-Suppress": "All",
      },
    });

    console.log(`[Email System] Notification sent to ${toEmail}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error("[Email System] Failed to send email notification:", err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export type RejectionStage = "WRITTEN_EXAM" | "INTERVIEW";

interface SendRejectionEmailParams {
  toEmail: string;
  studentName: string;
  applicationNumber: string;
  stage: RejectionStage;
  /** Admin's own wording from the fail dialog; replaces the default paragraph. */
  customMessage?: string;
}

/**
 * Consolation notice for an applicant who did not pass a selection round.
 * A step 8 (written exam) failure is announced as step 9 "ประกาศผลสอบ", and a
 * step 10 (interview) failure as step 11 "ประกาศผลสัมภาษณ์" — the announcement
 * stage, not the stage that was failed.
 */
export async function sendSelectionRejectionEmail({
  toEmail,
  studentName,
  applicationNumber,
  stage,
  customMessage,
}: SendRejectionEmailParams) {
  if (!toEmail) {
    console.warn("Rejection notice skipped: No recipient email provided.");
    return { success: false, error: "No email provided" };
  }

  const mailer = createMailer();
  if (!mailer) {
    return { success: false, error: "SMTP credentials not configured" };
  }
  const { transporter, from, fromDomain } = mailer;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || "https://studen-phi.vercel.app";
  const coursesUrl = `${baseUrl}/courses`;

  const isExam = stage === "WRITTEN_EXAM";
  const roundTh = isExam ? "การสอบข้อเขียน" : "การสอบสัมภาษณ์";
  const roundEn = isExam ? "Written Exam" : "Interview";

  const subject = `ประกาศผล${roundTh} ${roundEn} Result - ${applicationNumber}`;

  // Falls back to the standard letter when the admin leaves the dialog default.
  const reasonTh =
    customMessage?.trim() ||
    "เราขอยืนยันว่าท่านมีคุณสมบัติที่ยอดเยี่ยม อย่างไรก็ตาม เนื่องจากบริษัทฯ จำเป็นต้องจำกัดจำนวนผู้ได้รับเลือกในรอบนี้ จึงทำให้การคัดเลือกมีความแข่งขันสูงเป็นพิเศษ";

  const recommendTh =
    "แม้ว่าเราจะไม่สามารถตอบรับท่านเข้าเรียนในรุ่นนี้ได้ แต่สิ่งนี้ไม่ได้สะท้อนถึงศักยภาพของท่านแต่อย่างใด และเพื่อสนับสนุนความมุ่งมั่นของท่านในการเป็นนักบิน เราขอแนะนำให้ท่านพิจารณาลงทะเบียนในหลักสูตร CPL Integrated ATPL ซึ่งเป็นอีกหนึ่งเส้นทางคุณภาพที่จะช่วยให้ท่านได้รับใบอนุญาตและก้าวสู่อาชีพนักบินตามที่ตั้งใจไว้";

  const recommendEn =
    "While we are unable to offer you a seat in this cohort, this is by no means a reflection of your potential. To support your goal of becoming a pilot, we strongly encourage you to consider enrolling CPL integrated ATPL course. This program offers an excellent alternative pathway to gain your qualifications and pursue a successful career in aviation.";

  // Plain text fallback — essential for staying out of Junk in Gmail & Outlook.
  const textContent = `เรียน คุณ ${studentName}

ทางบริษัทฯ ขอขอบคุณท่านเป็นอย่างยิ่งที่ให้ความสนใจและเสียสละเวลาเข้าร่วม${roundTh}ในกระบวนการคัดเลือกกับเรา

${reasonTh}

${recommendTh}

ดูรายละเอียดหลักสูตร: ${coursesUrl}

ขอขอบคุณท่านอีกครั้งสำหรับความสนใจ และหวังเป็นอย่างยิ่งว่าจะได้ร่วมงาน และพบกันในอนาคต

ขอแสดงความนับถือ
Thai Inter Flying (TIF)

หมายเลขใบสมัคร: ${applicationNumber}

------------------------------------------------------

Dear ${studentName},

Thank you for taking the time to apply and go through our ${roundEn} selection process.

We want to emphasize that your application was strong and that you successfully met our standards. However, TIF has had to limit the total number of accepted applicants, making this year's selection exceptionally competitive.

${recommendEn}

Course details: ${coursesUrl}

We wish you the very best in your aviation journey and hope to see you in the skies soon.

Warm regards,
Thai Inter Flying (TIF)

Application Number: ${applicationNumber}

สถาบันการบิน Thai Inter Flying
โทรศัพท์: 02 114 3325 | อีเมล: salemarketing@tif.ac.th

${SENT_VIA_NOTE_TH}
${SENT_VIA_NOTE_EN}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin:0; padding:0; background-color:#f4f6f9; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color:#1e293b;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f4f6f9; padding:40px 10px;">
        <tr>
          <td align="center">
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:600px; background-color:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.08); border:1px solid #e2e8f0;">

              <!-- Header -->
              <tr>
                <td style="background-color:#0b132b; padding:32px 30px; text-align:center; border-bottom:4px solid #d4af37;">
                  <h1 style="color:#d4af37; margin:0 0 6px 0; font-size:24px; font-weight:800; font-family:Georgia, serif;">THAI INTER FLYING</h1>
                  <p style="color:#94a3b8; margin:0; font-size:13px; font-weight:500; letter-spacing:1px; text-transform:uppercase;">Pilot Training Academy &amp; Online Admission</p>
                </td>
              </tr>

              <!-- Thai letter -->
              <tr>
                <td style="padding:32px 30px 8px 30px;">
                  <p style="margin:0 0 6px 0; font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.5px;">
                    ประกาศผล${roundTh} &nbsp;|&nbsp; ${applicationNumber}
                  </p>
                  <h2 style="color:#0b132b; margin:0 0 16px 0; font-size:20px; font-weight:700;">เรียน คุณ ${studentName}</h2>

                  <p style="margin:0 0 16px 0; font-size:14px; line-height:1.7; color:#475569;">
                    ทางบริษัทฯ ขอขอบคุณท่านเป็นอย่างยิ่งที่ให้ความสนใจและเสียสละเวลาเข้าร่วม${roundTh}ในกระบวนการคัดเลือกกับเรา
                  </p>
                  <p style="margin:0 0 16px 0; font-size:14px; line-height:1.7; color:#475569;">${reasonTh}</p>
                  <p style="margin:0 0 24px 0; font-size:14px; line-height:1.7; color:#475569;">${recommendTh}</p>

                  <!-- Recommended pathway -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#fffbeb; border:1px solid #fef08a; border-radius:12px; margin-bottom:24px;">
                    <tr>
                      <td style="padding:18px 20px;">
                        <p style="margin:0 0 6px 0; font-size:13px; font-weight:700; color:#92400e;">เส้นทางที่แนะนำ / Recommended Pathway</p>
                        <p style="margin:0 0 14px 0; font-size:13px; color:#78350f; line-height:1.6;">
                          หลักสูตร CPL Integrated ATPL &mdash; เส้นทางคุณภาพสู่ใบอนุญาตนักบินพาณิชย์
                        </p>
                        <a href="${coursesUrl}" target="_blank" style="display:inline-block; background-color:#0b132b; color:#d4af37; font-size:13px; font-weight:700; text-decoration:none; padding:12px 24px; border-radius:10px; border:1px solid #d4af37;">
                          ดูรายละเอียดหลักสูตร / View Course
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="margin:0 0 16px 0; font-size:14px; line-height:1.7; color:#475569;">
                    ขอขอบคุณท่านอีกครั้งสำหรับความสนใจ และหวังเป็นอย่างยิ่งว่าจะได้ร่วมงาน และพบกันในอนาคต
                  </p>
                  <p style="margin:0; font-size:14px; line-height:1.7; color:#0b132b; font-weight:700;">
                    ขอแสดงความนับถือ<br>Thai Inter Flying (TIF)
                  </p>
                </td>
              </tr>

              <!-- Divider -->
              <tr>
                <td style="padding:0 30px;">
                  <div style="border-top:1px dashed #cbd5e1; margin:24px 0 0 0;"></div>
                </td>
              </tr>

              <!-- English letter -->
              <tr>
                <td style="padding:24px 30px 32px 30px;">
                  <h2 style="color:#0b132b; margin:0 0 16px 0; font-size:18px; font-weight:700;">Dear ${studentName},</h2>

                  <p style="margin:0 0 16px 0; font-size:14px; line-height:1.7; color:#475569;">
                    Thank you for taking the time to apply and go through our ${roundEn} selection process.
                  </p>
                  <p style="margin:0 0 16px 0; font-size:14px; line-height:1.7; color:#475569;">
                    We want to emphasize that your application was strong and that you successfully met our standards. However, TIF has had to limit the total number of accepted applicants, making this year's selection exceptionally competitive.
                  </p>
                  <p style="margin:0 0 16px 0; font-size:14px; line-height:1.7; color:#475569;">${recommendEn}</p>
                  <p style="margin:0 0 16px 0; font-size:14px; line-height:1.7; color:#475569;">
                    We wish you the very best in your aviation journey and hope to see you in the skies soon.
                  </p>
                  <p style="margin:0; font-size:14px; line-height:1.7; color:#0b132b; font-weight:700;">
                    Warm regards,<br>Thai Inter Flying (TIF)
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color:#f8fafc; padding:20px 30px; border-top:1px solid #e2e8f0; text-align:center;">
                  <p style="margin:0 0 4px 0; font-size:12px; font-weight:700; color:#475569;">สถาบันการบิน Thai Inter Flying</p>
                  <p style="margin:0; font-size:11px; color:#64748b; line-height:1.5;">
                    📞 โทรศัพท์: 02 114 3325 | 📧 อีเมล: salemarketing@tif.ac.th<br>
                    🌐 เว็บไซต์: www.tif.ac.th
                  </p>
                  <p style="margin:12px 0 0 0; font-size:10px; color:#94a3b8; line-height:1.5; border-top:1px solid #e2e8f0; padding-top:10px;">
                    ${SENT_VIA_NOTE_TH}
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from,
      replyTo: "salemarketing@tif.ac.th",
      to: toEmail,
      subject,
      text: textContent,
      html: htmlContent,
      messageId: `<${applicationNumber}.${stage}.${Date.now()}@${fromDomain}>`,
      headers: {
        "Auto-Submitted": "auto-generated",
        "X-Auto-Response-Suppress": "All",
      },
    });

    console.log(`[Email System] Rejection notice (${stage}) sent to ${toEmail}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error("[Email System] Failed to send rejection notice:", err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
