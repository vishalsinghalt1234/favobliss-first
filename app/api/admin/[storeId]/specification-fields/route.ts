import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";

const SpecificationFieldSchema = z.object({
  name: z.string().min(1, "Name is required"),
  groupId: z.string().min(1, "Group is required"),
});

// POST: Create a new specification field
export async function POST(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await auth();
    const body = await request.json();
    const validatedData = SpecificationFieldSchema.safeParse(body);

    if (!validatedData.success) {
      return new NextResponse("Invalid data provided", { status: 400 });
    }

    const { name, groupId } = validatedData.data;

    if (!session || !session.user || !session.user.id) {
      return new NextResponse("Unauthorized Access", { status: 401 });
    }

    if (!params.storeId) {
      return new NextResponse("Store Id is required", { status: 400 });
    }

    const storeById = await db.store.findUnique({
      where: { id: params.storeId },
    });

    if (!storeById) {
      return new NextResponse("Store does not exist", { status: 404 });
    }

    const group = await db.specificationGroup.findUnique({
      where: { id: groupId, storeId: params.storeId },
    });

    if (!group) {
      return new NextResponse("Invalid group", { status: 400 });
    }

    const specificationField = await db.specificationField.create({
      data: {
        name,
        groupId,
        storeId: params.storeId,
      },
    });

    return NextResponse.json(specificationField);
  } catch (error) {
    console.log("[SPECIFICATION_FIELDS_POST]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store Id is required", { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const page   = parseInt(searchParams.get("page")  || "1", 10);
    const limit  = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where: Prisma.SpecificationFieldWhereInput = {
      storeId: params.storeId,
      ...(search
        ? {
            name: {
              contains: search,
              mode: Prisma.QueryMode.insensitive,
            },
          }
        : {}),
    };

    const [specificationFields, total] = await Promise.all([
      db.specificationField.findMany({
        where,
        include: {
          group: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.specificationField.count({ where }),
    ]);

    const formatted = specificationFields.map((item) => ({
      id: item.id,
      name: item.name,
      group: item.group.name,
      createdAt: item.createdAt.toISOString(),
    }));

    return NextResponse.json({
      rows: formatted,
      rowCount: total,
      page,
      limit,
    });
  } catch (error) {
    console.error("[SPECIFICATION_FIELDS_GET]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
