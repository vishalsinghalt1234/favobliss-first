import { auth } from "@/auth";
import { db } from "@/lib/db";
import qs from "query-string";
import { NextResponse } from "next/server";
import { AddressSchema } from "@/schemas/address.schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = AddressSchema.safeParse(body);

    if (!validatedData.success) {
      return new NextResponse("Invalid Credentials", { status: 401 });
    }

    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const address = await db.address.create({
      data: {
        userId: session.user.id,
        ...validatedData.data,
      },
    });

    if (address.isDefault) {
      await db.address.updateMany({
        where: {
          userId: session.user.id,
          id: {
            not: {
              equals: address.id,
            },
          },
        },
        data: {
          isDefault: false,
        },
      });
    }

    return NextResponse.json(address);
  } catch (error) {
    console.error("ADDRESS POST API", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const address = await db.address.findMany({
      where: {
        userId: session.user.id,
      },
    });

    return NextResponse.json(address);
  } catch (error) {
    console.error("ADDRESS GET API", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const url = request.url;
    const { query } = qs.parseUrl(url);
    const id = query["id"] as string | null;
    const ids = query["ids"] as string | string[] | null;

    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Handle bulk delete
    if (ids) {
      const idsArray = Array.isArray(ids) ? ids : [ids];

      // Check if any of the addresses to delete is the default
      const addresses = await db.address.findMany({
        where: {
          id: { in: idsArray },
          userId: session.user.id,
        },
      });

      const hasDefault = addresses.some((addr) => addr.isDefault);
      const allAddressesCount = await db.address.count({
        where: { userId: session.user.id },
      });

      // Prevent deleting all addresses if default is included
      if (hasDefault && idsArray.length >= allAddressesCount) {
        return new NextResponse(
          "Cannot delete all addresses including the default address",
          { status: 400 }
        );
      }

      // Delete the addresses
      const deletedAddresses = await db.address.deleteMany({
        where: {
          id: { in: idsArray },
          userId: session.user.id,
        },
      });

      // If default was deleted and there are remaining addresses, set a new default
      if (hasDefault && idsArray.length < allAddressesCount) {
        const remainingAddress = await db.address.findFirst({
          where: {
            userId: session.user.id,
            id: { notIn: idsArray },
          },
        });

        if (remainingAddress) {
          await db.address.update({
            where: { id: remainingAddress.id },
            data: { isDefault: true },
          });
        }
      }

      return NextResponse.json({
        success: true,
        deletedCount: deletedAddresses.count,
      });
    }

    // Handle single delete (legacy)
    if (!id) {
      return new NextResponse("Invalid Credentials", { status: 401 });
    }

    const addressToDelete = await db.address.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!addressToDelete) {
      return new NextResponse("Address not found", { status: 404 });
    }

    // Check if this is the default address
    if (addressToDelete.isDefault) {
      const addressCount = await db.address.count({
        where: { userId: session.user.id },
      });

      // If there are other addresses, set a new default
      if (addressCount > 1) {
        const newDefaultAddress = await db.address.findFirst({
          where: {
            userId: session.user.id,
            id: { not: id },
          },
        });

        if (newDefaultAddress) {
          await db.address.update({
            where: { id: newDefaultAddress.id },
            data: { isDefault: true },
          });
        }
      }
    }

    const address = await db.address.delete({
      where: {
        id,
        userId: session.user.id,
      },
    });

    return NextResponse.json(address);
  } catch (error) {
    console.error("ADDRESS DELETE API", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}