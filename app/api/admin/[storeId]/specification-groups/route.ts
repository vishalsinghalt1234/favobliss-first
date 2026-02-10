import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { format } from "date-fns";

const SpecificationGroupSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

// POST: Create a new specification group
export async function POST(
  request: Request,
  { params }: { params: { storeId: string } },
) {
  try {
    const session = await auth();
    const body = await request.json();
    const validatedData = SpecificationGroupSchema.safeParse(body);

    if (!validatedData.success) {
      return new NextResponse("Invalid data provided", { status: 400 });
    }

    const { name } = validatedData.data;

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

    const specificationGroup = await db.specificationGroup.create({
      data: {
        name,
        storeId: params.storeId,
      },
    });

    return NextResponse.json(specificationGroup);
  } catch (error) {
    console.log("[SPECIFICATION_GROUPS_POST]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { storeId: string } },
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store Id is required", { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where: Prisma.SpecificationGroupWhereInput = {
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

    const [specificationGroups, total] = await Promise.all([
      db.specificationGroup.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.specificationGroup.count({ where }),
    ]);

    const formatted = specificationGroups.map((item) => ({
      id: item.id,
      name: item.name,
      createdAt: format(item.createdAt, "MMMM do, yyyy"),
    }));

    return NextResponse.json({
      rows: formatted,
      rowCount: total,
      page,
      limit,
    });
  } catch (error) {
    console.error("[SPECIFICATION_GROUPS_GET]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
