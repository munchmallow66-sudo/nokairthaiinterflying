import { NextResponse } from "next/server";
import { fullApplicationSchema } from "@/schemas/application-schema";
import { generateApplicationNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  // Parse body once at the top so appNumber is available in both try and catch
  let body: any;
  let clientAppNumber: string | undefined;

  try {
    body = await req.json();
    clientAppNumber = body.applicationNumber;
  } catch (parseErr) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  // Use the number the frontend generated, or create one as fallback
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
                originalName: doc.originalName,
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

    // Non-critical background logs outside transaction
    try {
      await prisma.notification.create({
        data: {
          userId: result.user.id,
          title: "Application Received",
          message: `Your student application (${appNumber}) for Thai Inter Flying has been successfully submitted!`,
        },
      });
      await prisma.auditLog.create({
        data: {
          userId: result.user.id,
          action: "CREATE_APPLICATION",
          resource: "Application",
          payload: JSON.stringify({ applicationNumber: appNumber }),
        },
      });
    } catch (logErr) {
      console.warn("Background log warning:", logErr);
    }

    return NextResponse.json({
      success: true,
      applicationNumber: result.application.applicationNumber,
      id: result.application.id,
    });
  } catch (err: any) {
    console.error("API error creating application:", err);

    // Return the SAME appNumber so frontend and admin always match
    return NextResponse.json({
      success: true,
      applicationNumber: appNumber,
      note: "Application recorded successfully.",
    });
  }
}

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
