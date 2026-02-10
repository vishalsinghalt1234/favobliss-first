import { Metadata } from "next";
import { format } from "date-fns";
import { db } from "@/lib/db";
import { LocationColumn } from "@/components/admin/store/utils/columns";
import { LocationClient } from "@/components/admin/store/utils/location-client";

export const metadata: Metadata = {
  title: "Store | Locations",
};

const LocationsPage = async ({ params }: { params: { storeId: string } }) => {
  const pageSize = 10;

  const locations = await db.location.findMany({
    where: {
      storeId: params.storeId,
    },
    take: pageSize,
    skip: 0,
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await db.location.count({
    where: {
      storeId: params.storeId,
    },
  });

  const formattedLocations: LocationColumn[] = locations.map((item) => ({
    id: item.id,
    pincode: item.pincode,
    city: item.city,
    state: item.state,
    country: item.country,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <LocationClient data={formattedLocations} initialRowCount={total} />
      </div>
    </div>
  );
};

export default LocationsPage;