import { Metadata } from "next";
import { format } from "date-fns";
import { db } from "@/lib/db";
import { LocationGroupColumn } from "@/components/admin/store/utils/columns";
import { LocationGroupClient } from "@/components/admin/store/utils/location-group-client";

export const metadata: Metadata = {
  title: "Store | Location Groups",
};

const LocationGroupsPage = async ({
  params,
}: {
  params: { storeId: string };
}) => {
  const pageSize = 10;

  const [locationGroups, total, locations] = await Promise.all([
    db.locationGroup.findMany({
      where: {
        storeId: params.storeId,
      },
      include: {
        locations: true,
      },
      take: pageSize,
      skip: 0,
      orderBy: {
        createdAt: "desc",
      },
    }),
    db.locationGroup.count({
      where: {
        storeId: params.storeId,
      },
    }),
    db.location.findMany({
      where: {
        storeId: params.storeId,
      },
      select: {
        id: true,
        pincode: true,
        city: true,
      },
    }),
  ]);

  const formattedLocationGroups: LocationGroupColumn[] = locationGroups.map(
    (item) => ({
      id: item.id,
      name: item.name,
      locationCount: item.locations.length,
      isCodAvailable: item.isCodAvailable,
      isExpressDelivery: item.isExpressDelivery ?? false,
      deliveryDays: item.deliveryDays ?? 0,
      createdAt: format(item.createdAt, "MMMM do, yyyy"),
    })
  );

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <LocationGroupClient
          data={formattedLocationGroups}
          locations={locations}
          initialRowCount={total}
        />
      </div>
    </div>
  );
};

export default LocationGroupsPage;