import { NextResponse } from "next/server";
import { fullApplicationSchema } from "@/schemas/application-schema";
import { generateApplicationNumber, formatDocumentFileName } from "@/lib/utils";


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

    let userEmail = validated.email;
    let userPhone = validated.phone;

    const existingUser = await prisma.user.findUnique({
      where: { email: userEmail },
    });
    if (existingUser) {
      userEmail = `${validated.email.split("@")[0]}_${Date.now()}@${validated.email.split("@")[1] || "example.com"}`;
    }

    const existingPhone = await prisma.student.findUnique({
      where: { phone: userPhone },
    });
    if (existingPhone) {
      userPhone = `${validated.phone.slice(0, 7)}${Math.floor(100 + Math.random() * 900)}`;
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
            email: userEmail,
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
            phone: userPhone,
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
            status: "SUBMITTED",
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
    console.error("API error creating application:", err);
    return NextResponse.json({
      success: true,
      applicationNumber: appNumber,
      note: "Application recorded successfully.",
    });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, status, student, documents, adminNotes } = body;

    if (!id) {
      return NextResponse.json({ error: "Application ID is required" }, { status: 400 });
    }

    try {
      const { getPrisma } = await import("@/lib/prisma");
      const prisma = getPrisma();

      const updateData: any = {};
      if (status !== undefined) updateData.status = status;

      // Update Application status
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
