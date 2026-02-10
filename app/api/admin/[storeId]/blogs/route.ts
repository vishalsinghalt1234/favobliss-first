import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (slug) {
      const blog = await db.blog.findUnique({
        where: { slug },
      });

      if (!blog) {
        return NextResponse.json({ error: "Blog not found" }, { status: 404 });
      }

      return NextResponse.json(blog, { status: 200 });
    }

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where: Prisma.BlogWhereInput = search
      ? {
          title: {
            contains: search,
            mode: Prisma.QueryMode.insensitive, 
          },
        }
      : {};

    const [blogs, total] = await Promise.all([
      db.blog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.blog.count({ where }),
    ]);

    return NextResponse.json(
      {
        rows: blogs, // ← renamed from "blogs" to "rows" (matches DataTable expectation)
        rowCount: total, // ← renamed from "total" to "rowCount"
        page,
        limit,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 },
    );
  }
}
