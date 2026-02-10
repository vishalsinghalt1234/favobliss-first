import { Metadata } from "next";
import { format } from "date-fns";
import { db } from "@/lib/db";
import { SpecificationFieldClient } from "@/components/admin/store/utils/specification-field-client";

interface SpecificationFieldColumn {
  id: string;
  name: string;
  group: string;
  createdAt: string;
}

export const metadata: Metadata = {
  title: "Store | Specification Fields",
};

const SpecificationFieldsPage = async ({
  params,
}: {
  params: { storeId: string };
}) => {
  const pageSize = 10;

  const specificationFields = await db.specificationField.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      group: true,
    },
    take: pageSize,
    skip: 0,
    orderBy: {
      createdAt: "desc",
    },
  });

  const total = await db.specificationField.count({
    where: {
      storeId: params.storeId,
    },
  });

  const formattedFields: SpecificationFieldColumn[] = specificationFields.map(
    (item) => ({
      id: item.id,
      name: item.name,
      group: item.group.name,
      createdAt: format(item.createdAt, "MMMM do, yyyy"),
    })
  );

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SpecificationFieldClient data={formattedFields} initialRowCount={total} />
      </div>
    </div>
  );
};

export default SpecificationFieldsPage;