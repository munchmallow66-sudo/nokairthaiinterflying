import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fullApplicationSchema } from "@/schemas/application-schema";
import { generateApplicationNumber } from "@/lib/utils";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = fullApplicationSchema.parse(body);

    // Check duplicate email / phone / national ID
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email address is already registered in the system." },
        { status: 400 }
      );
    }

    const existingPhone = await prisma.student.findUnique({
      where: { phone: validated.phone },
    });
    if (existingPhone) {
      return NextResponse.json(
        { error: "Phone number is already associated with another application." },
        { status: 400 }
      );
    }

    if (validated.nationalId) {
      const existingNatId = await prisma.student.findUnique({
        where: { nationalId: validated.nationalId },
      });
      if (existingNatId) {
        return NextResponse.json(
          { error: "National ID is already associated with another student profile." },
          { status: 400 }
        );
      }
    }

    // Get default course or first available course
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

    // Generate unique app number
    const appNumber = generateApplicationNumber();

    // Execute Prisma Transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          name: `${validated.firstNameEn} ${validated.lastNameEn}`,
          email: validated.email,
          role: "STUDENT",
        },
      });

      // 2. Create Student Profile
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
              school: validated.school,
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

      // 3. Create Application
      const application = await tx.application.create({
        data: {
          applicationNumber: appNumber,
          studentId: student.id,
          courseId: defaultCourse.id,
          branch: "Bangkok Headquarters",
          status: "SUBMITTED",
          documents: {
            create: validated.documents.map((doc) => ({
              type: doc.type as any,
              secureUrl: doc.secureUrl,
              publicId: doc.publicId,
              originalName: doc.originalName,
            })),
          },
        },
      });

      // 4. Create Notification for user
      await tx.notification.create({
        data: {
          userId: user.id,
          title: "Application Received",
          message: `Your student application (${appNumber}) for Thai Inter Flying has been successfully submitted!`,
        },
      });

      // 5. Create Audit Log
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: "CREATE_APPLICATION",
          resource: "Application",
          payload: JSON.stringify({ applicationNumber: appNumber }),
        },
      });

      return application;
    });

    return NextResponse.json({
      success: true,
      applicationNumber: result.applicationNumber,
      id: result.id,
    });
  } catch (err: any) {
    console.error("API error creating application:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process student application" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
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
