import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { fullApplicationSchema } from "@/schemas/application-schema";
import { generateApplicationNumber, formatDocumentFileName } from "@/lib/utils";
import { verifyAdminSessionToken } from "@/lib/auth";


export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    const { getPrisma } = await import("@/lib/prisma");
    const prisma = getPrisma();
    const applications = await prisma.application.findMany({
      include: {
        student: {
          include: {
            user: true,
            address: true,
            education: true,
            emergency: true,
            parent: true,
            medical: true,
            english: true,
          },
        },
        course: true,
        documents: true,
        payments: true,
        interviews: true,
        adminNotes: {
          include: {
            author: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(applications);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rateCheck = checkRateLimit(`app_submit_${ip}`, 5, 60 * 1000);

  if (!rateCheck.success) {
    return NextResponse.json(
      { error: `ท่านทำรายการส่งใบสมัครถี่เกินไป กรุณารออีก ${rateCheck.resetInSeconds} วินาที` },
      { status: 429 }
    );
  }

  let body: any;
  let clientAppNumber: string | undefined;

  try {
    body = await req.json();
    clientAppNumber = body.applicationNumber;
  } catch (parseErr) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const appNumber = clientAppNumber || generateApplicationNumber();

  try {
    const { getPrisma } = await import("@/lib/prisma");
    const prisma = getPrisma();
    const validated = fullApplicationSchema.parse(body);

    // Duplicate check: national ID is the only field that blocks a resubmission.
    // Email and phone are allowed to repeat (e.g. siblings sharing a parent's
    // contact details) and are now stored exactly as entered — no more mangling.
    if (validated.nationalId) {
      const existingStudent = await prisma.student.findUnique({
        where: { nationalId: validated.nationalId },
        include: {
          applications: { orderBy: { createdAt: "desc" }, take: 1 },
        },
      });

      const existingApplication = existingStudent?.applications?.[0];
      if (existingApplication) {
        return NextResponse.json(
          {
            success: false,
            duplicate: true,
            applicationNumber: existingApplication.applicationNumber,
            error: "An application with this national ID has already been submitted.",
          },
          { status: 409 }
        );
      }
    }

    let defaultCourse = await prisma.course.findFirst();
    if (!defaultCourse) {
      defaultCourse = await prisma.course.create({
        data: {
          slug: "cpl",
          code: "CPL",
          name: "Commercial Pilot License",
          description: "Default CPL Training Course",
          price: 1250000,
          duration: "14 Months",
        },
      });
    }

    const dbTransactionPromise = prisma.$transaction(
      async (tx) => {
        const user = await tx.user.create({
          data: {
            name: `${validated.firstNameEn} ${validated.lastNameEn}`,
            email: validated.email,
            role: "STUDENT",
          },
        });

        const student = await tx.student.create({
          data: {
            userId: user.id,
            title: validated.title,
            firstNameTh: validated.firstNameTh,
            lastNameTh: validated.lastNameTh,
            firstNameEn: validated.firstNameEn,
            lastNameEn: validated.lastNameEn,
            nickname: validated.nickname,
            gender: validated.gender,
            birthday: new Date(validated.birthday),
            age: validated.age,
            nationality: validated.nationality,
            religion: validated.religion,
            nationalId: validated.nationalId || null,
            passport: validated.passport || null,
            phone: validated.phone,
            lineId: validated.lineId,
            facebook: validated.facebook,

            address: {
              create: {
                currentAddress: validated.currentAddress,
                province: validated.province,
                district: validated.district,
                subdistrict: validated.subdistrict,
                postalCode: validated.postalCode,
              },
            },
            education: {
              create: {
                school: validated.school || "-",
                university: validated.university,
                degree: validated.degree,
                gpax: validated.gpax,
                graduationYear: validated.graduationYear,
              },
            },
            emergency: {
              create: {
                name: validated.emergencyName,
                relationship: validated.relationship,
                phone: validated.emergencyPhone,
                address: validated.emergencyAddress,
              },
            },
            parent: {
              create: {
                fatherName: validated.fatherName,
                motherName: validated.motherName,
                occupation: validated.parentOccupation,
                phone: validated.parentPhone,
                address: validated.parentAddress,
              },
            },
            medical: {
              create: {
                height: validated.height,
                weight: validated.weight,
                bloodType: validated.bloodType,
                medicalConditions: validated.medicalConditions,
                allergy: validated.allergy,
                medication: validated.medication,
              },
            },
            english: {
              create: {
                toeicScore: validated.toeicScore,
                ieltsScore: validated.ieltsScore,
                icaoLevel: validated.icaoLevel,
                otherCertificates: validated.otherCertificates,
              },
            },
            employment: {
              create: {
                company: validated.company,
                position: validated.position,
                years: validated.years,
              },
            },
          },
        });

        const application = await tx.application.create({
          data: {
            applicationNumber: appNumber,
            studentId: student.id,
            courseId: defaultCourse.id,
            branch: "Bangkok Headquarters",
            status: "DOCS_UNDER_REVIEW",
            documents: {
              create: (validated.documents || []).map((doc) => ({
                type: doc.type as any,
                secureUrl: doc.secureUrl,
                publicId: doc.publicId,
                originalName: formatDocumentFileName(
                  appNumber,
                  validated.title,
                  validated.firstNameEn || validated.firstNameTh,
                  doc.type,
                  doc.originalName
                ),
              })),
            },
          },
        });

        return { application, user };
      },
      {
        maxWait: 5000,
        timeout: 10000,
      }
    );

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("DB Connection Timeout")), 3500)
    );

    const result: any = await Promise.race([dbTransactionPromise, timeoutPromise]);

    return NextResponse.json({
      success: true,
      applicationNumber: result.application.applicationNumber,
      id: result.application.id,
    });
  } catch (err: any) {
    console.error("API error creating application:", err instanceof Error ? err.stack : err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Unknown server error while creating application.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      status,
      student,
      adminNotes,
      joinOpenHouse,
      remarks,
      action,
      docId,
      verifiedStatus,
      newUrl,
      newName,
      type,
      url,
      name,
      reason,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    try {
      const { getPrisma } = await import("@/lib/prisma");
      const prisma = getPrisma();

      // Single-document actions — isolated in their own try/catch so a docId
      // that doesn't resolve to a real DB row (e.g. a client-only document
      // that never made it into Postgres) can't block the rest of this PATCH.
      if (action === "TOGGLE_DOC_VERIFY" && docId) {
        try {
          await prisma.document.update({
            where: { id: docId },
            data: { isVerified: !!verifiedStatus, isRejected: false, rejectReason: null },
          });
        } catch (docErr) {
          console.warn(`Could not toggle verification for document ${docId}:`, docErr);
        }
      } else if (action === "REPLACE_DOC" && docId) {
        try {
          await prisma.document.update({
            where: { id: docId },
            data: {
              secureUrl: newUrl,
              ...(newName ? { originalName: newName } : {}),
              isVerified: false,
              isRejected: false,
              rejectReason: null,
            },
          });
        } catch (docErr) {
          console.warn(`Could not replace document ${docId}:`, docErr);
        }
      } else if (action === "REJECT_DOC" && docId) {
        try {
          await prisma.document.update({
            where: { id: docId },
            data: { isVerified: false, isRejected: true, rejectReason: reason || null },
          });
        } catch (docErr) {
          console.warn(`Could not reject document ${docId}:`, docErr);
        }
      } else if (action === "DELETE_DOC" && docId) {
        try {
          await prisma.document.delete({ where: { id: docId } });
        } catch (docErr) {
          console.warn(`Could not delete document ${docId}:`, docErr);
        }
      } else if (action === "ADD_EXTRA_DOC") {
        try {
          await prisma.document.create({
            data: {
              applicationId: id,
              type: type as any,
              secureUrl: url,
              publicId: `tif_extra_${Date.now()}`,
              originalName: name,
              isVerified: false,
            },
          });
        } catch (docErr) {
          console.warn("Could not add extra document:", docErr);
        }
      } else if (action === "VERIFY_ALL_DOCS") {
        try {
          await prisma.document.updateMany({
            where: { applicationId: id },
            data: { isVerified: true, isRejected: false, rejectReason: null },
          });
        } catch (docErr) {
          console.warn(`Could not verify all documents for application ${id}:`, docErr);
        }
      }

      const updateData: any = {};
      if (status !== undefined) updateData.status = status;
      if (joinOpenHouse !== undefined) updateData.joinOpenHouse = joinOpenHouse;
      if (remarks !== undefined) updateData.remarks = remarks;

      // Update Application status and details
      const updatedApp = await prisma.application.update({
        where: { id },
        data: updateData,
      });

      // Update student details if provided
      if (student && updatedApp.studentId) {
        await prisma.student.update({
          where: { id: updatedApp.studentId },
          data: {
            ...(student.firstNameTh && { firstNameTh: student.firstNameTh }),
            ...(student.lastNameTh && { lastNameTh: student.lastNameTh }),
            ...(student.firstNameEn && { firstNameEn: student.firstNameEn }),
            ...(student.lastNameEn && { lastNameEn: student.lastNameEn }),
            ...(student.phone && { phone: student.phone }),
            ...(student.nationalId && { nationalId: student.nationalId }),
            ...(student.passport && { passport: student.passport }),
          },
        });
      }

      // Persist the newest admin note — callers always prepend the new note
      // at index 0 of the array. Requires a resolvable admin session, since
      // AdminNote.authorId is a required FK to a real User row.
      if (Array.isArray(adminNotes) && adminNotes.length > 0) {
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get("admin_session")?.value;
        const session = sessionToken ? await verifyAdminSessionToken(sessionToken) : null;

        if (session?.id) {
          try {
            await prisma.adminNote.create({
              data: {
                applicationId: id,
                authorId: session.id,
                content: adminNotes[0].content,
              },
            });
          } catch (noteErr) {
            console.warn("Could not persist admin note:", noteErr);
          }
        } else {
          console.warn("Skipped persisting admin note: no valid admin session on request");
        }
      }

      return NextResponse.json({ success: true, application: updatedApp });
    } catch (dbErr) {
      console.warn("DB application update notice:", dbErr);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch (e) {}
    }

    if (!id) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    try {
      const { getPrisma } = await import("@/lib/prisma");
      const prisma = getPrisma();

      // Find application and associated student/user IDs before deletion
      const targetApp = await prisma.application.findFirst({
        where: {
          OR: [{ id }, { applicationNumber: id }],
        },
        include: {
          student: true,
        },
      });

      if (targetApp) {
        const studentId = targetApp.studentId;
        const userId = targetApp.student?.userId;

        // Delete Application first
        await prisma.application.delete({
          where: { id: targetApp.id },
        });

        // Delete associated Student record if exists
        if (studentId) {
          try {
            await prisma.student.delete({
              where: { id: studentId },
            });
          } catch (e) {}
        }

        // Delete associated User record if exists
        if (userId) {
          try {
            await prisma.user.delete({
              where: { id: userId },
            });
          } catch (e) {}
        }
      }

      // Also clean up any orphan students with no applications attached
      try {
        const orphanStudents = await prisma.student.findMany({
          where: {
            applications: {
              none: {},
            },
          },
          select: { id: true, userId: true },
        });

        for (const orphan of orphanStudents) {
          try {
            await prisma.student.delete({ where: { id: orphan.id } });
            if (orphan.userId) {
              await prisma.user.delete({ where: { id: orphan.userId } });
            }
          } catch (e) {}
        }
      } catch (e) {}

    } catch (dbErr) {
      console.warn("DB application delete notice:", dbErr);
    }

    return NextResponse.json({ success: true, message: "Application deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
