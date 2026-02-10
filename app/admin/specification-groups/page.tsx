import { Metadata } from "next";
import { format } from "date-fns";
import { db } from "@/lib/db";
import { SpecificationGroupClient } from "@/components/admin/store/utils/specification-group-client";

interface SpecificationGroupColumn {
  id: string;
  name: string;
  createdAt: string;
}

export const metadata: Metadata = {
  title: "Store | Specification Groups",
};

const SpecificationGroupsPage = async ({
  params,
}: {
  params: { storeId: string };
}) => {
  const pageSize = 10;

  const specificationGroups = await db.specificationGroup.findMany({
    where: {
      storeId: params.storeId,
    },
    take: pageSize,
    skip: 0,
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await db.specificationGroup.count({
    where: {
      storeId: params.storeId,
    },
  });

  const formattedGroups: SpecificationGroupColumn[] = specificationGroups.map(
    (item) => ({
      id: item.id,
      name: item.name,
      createdAt: format(item.createdAt, "MMMM do, yyyy"),
    })
  );

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SpecificationGroupClient 
          data={formattedGroups} 
          initialRowCount={total} 
        />
      </div>
    </div>
  );
};

export default SpecificationGroupsPage;