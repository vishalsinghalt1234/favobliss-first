import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { pincode, city, state, country } = await request.json();
    const session = await auth();

    if (!session) {
      return new NextResponse("Unauthorized Access", { status: 401 });
    }

    if (!pincode) {
      return new NextResponse("Pincode is required", { status: 400 });
    }

    if (!city) {
      return new NextResponse("City is required", { status: 400 });
    }

    if (!state) {
      return new NextResponse("State is required", { status: 400 });
    }

    if (!country) {
      return new NextResponse("Country is required", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("StoreId is required", { status: 400 });
    }

    const storeById = await db.store.findUnique({
      where: {
        id: params.storeId,
      },
    });

    if (!storeById) {
      return new NextResponse("Store does not exist", { status: 404 });
    }

    const location = await db.location.create({
      data: {
        pincode,
        city,
        state,
        country,
        storeId: params.storeId,
      },
    });

    return NextResponse.json(location);
  } catch (error) {
    console.log("[LOCATION_POST]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}



export async function GET(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse("StoreId is required", { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get("pincode");

    if (pincode) {
      const location = await db.location.findUnique({
        where: {
            pincode,
        },
      });

      if (!location) {
        return new NextResponse("Location not found", { status: 404 });
      }

      return NextResponse.json(location);
    }

    const page   = parseInt(searchParams.get("page")  || "1", 10);
    const limit  = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where: Prisma.LocationWhereInput = {
      storeId: params.storeId,
      ...(search
        ? {
            OR: [
              { city: { contains: search, mode: Prisma.QueryMode.insensitive } },
              { pincode: { contains: search } },
              { state: { contains: search, mode: Prisma.QueryMode.insensitive } },
            ],
          }
        : {}),
    };

    const [locations, total] = await Promise.all([
      db.location.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.location.count({ where }),
    ]);

    return NextResponse.json({
      rows: locations,
      rowCount: total,
      page,
      limit,
    });
  } catch (error) {
    console.error("[LOCATION_GET]", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
