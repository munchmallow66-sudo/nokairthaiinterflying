import nodemailer from "nodemailer";

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

  const host = process.env.SMTP_HOST || "smtp.office365.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || "Tifand.Nok@nokair.co.th";
  const pass = process.env.SMTP_PASS || "MaNE6iv438kz";

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: {
      ciphers: "SSLv3",
      rejectUnauthorized: false,
    },
  });

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
Tracking Password: ${password}

You can track your application status at: https://studen-phi.vercel.app/track

Thai Inter Flying Academy
Tel: 02 114 3325 | Email: salemarketing@tif.ac.th`
    : `เรียนคุณ ${studentName},

สถาบันการบิน Thai Inter Flying ขอขอบพระคุณที่ท่านให้ความสนใจสมัครเรียนหลักสูตรนักบิน ระบบได้บันทึกข้อมูลใบสมัครของท่านเรียบร้อยแล้ว

หมายเลขใบสมัคร: ${applicationNumber}
รหัสผ่านสำหรับติดตามสถานะ: ${password}

ท่านสามารถนำหมายเลขใบสมัครและ Password ไปเข้าตรวจสอบสถานะได้ที่: https://studen-phi.vercel.app/track

สถาบันการบิน Thai Inter Flying
โทรศัพท์: 02 114 3325 | อีเมล: salemarketing@tif.ac.th`;

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
                          ${isEn ? "Tracking Password" : "รหัสผ่านสำหรับติดตามสถานะ (Tracking Password)"}
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
                          ? "You can track your application status at any time using your Application Number and Password."
                          : "ท่านสามารถนำหมายเลขใบสมัครและ Password ข้างต้น ไปเข้าตรวจสอบสถานะได้ตลอดเวลาที่หน้าเว็บไซต์"
                      }</li>
                    </ul>
                  </div>

                  <!-- Call to action button -->
                  <div style="text-align:center; margin-bottom:28px;">
                    <a href="https://studen-phi.vercel.app/track" target="_blank" style="display:inline-block; background-color:#0b132b; color:#d4af37; font-size:14px; font-weight:700; text-decoration:none; padding:14px 28px; border-radius:10px; border:1px solid #d4af37;">
                      🔍 ${isEn ? "Track Application Status" : "คลิกที่นี่เพื่อติดตามสถานะการสมัคร"}
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
      from: {
        name: "Thai Inter Flying x Nok Air",
        address: user,
      },
      replyTo: "salemarketing@tif.ac.th",
      to: toEmail,
      subject,
      text: textContent,
      html: htmlContent,
      headers: {
        "X-Priority": "1",
        "X-MSMail-Priority": "High",
        "Importance": "high",
      },
    });

    console.log(`[Email System] Notification sent to ${toEmail}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error("[Email System] Failed to send email notification:", err);
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
