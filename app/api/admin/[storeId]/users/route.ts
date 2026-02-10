import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { format } from "date-fns";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page   = parseInt(searchParams.get("page")  || "1", 10);
    const limit  = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { name:  { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

    const [rawUsers, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          name: true,
          mobileNumber: true,
          dob: true,
          createdAt: true,
          orders: {
            where: { isPaid: true },
            select: { id: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.user.count({ where }),
    ]);

    const formattedUsers = rawUsers.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name ?? "—",
      mobileNumber: user.mobileNumber ?? "—",
      dob: user.dob ? format(user.dob, "dd/MM/yyyy") : "—",
      totalOrders: user.orders.length,
      createdAt: format(user.createdAt, "MMMM do, yyyy"),
    }));

    return NextResponse.json({
      rows: formattedUsers,
      rowCount: total,
      page,
      limit,
    });
  } catch (error) {
    console.error("[ADMIN_USERS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}