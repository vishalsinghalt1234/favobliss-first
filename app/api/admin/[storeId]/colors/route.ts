import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

export async function POST( 
    request : Request,
    { params } : { params : { storeId : string}}
) {
    try {

        const { name, value } = await request.json();
        const session = await auth();

        if (!session ){
            return new NextResponse("Unauthorized Access", {status : 401});
        }

        if (!name){
            return new NextResponse("Name is required", {status :400});
        }

        if (!value){
            return new NextResponse("Value is required", {status :400});
        }

        if (!params.storeId) {
            return new NextResponse("StoreId is required", {status :400});
        }

        const storeById = await db.store.findUnique({
            where : {
                id : params.storeId
            }
        });

        if (!storeById ){
            return new NextResponse("Store does not exists", {status :404});
        }

        const color = await db.color.create({
            data : {
                name,
                value,
                storeId : params.storeId
            }
        });

        return NextResponse.json(color);

    } catch (error) {
        console.log("COLOR POST", error);
        return new NextResponse("Internal server error", { status : 500});
    }
}



export async function GET(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const page  = parseInt(searchParams.get("page")  || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where: Prisma.ColorWhereInput = {
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

    const [colors, total] = await Promise.all([
      db.color.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.color.count({ where }),
    ]);

    return NextResponse.json({
      rows: colors,
      rowCount: total,
      page,
      limit,
    });
  } catch (error) {
    console.error("COLORS_GET", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}