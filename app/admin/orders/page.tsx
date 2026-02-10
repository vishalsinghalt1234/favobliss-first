import { Metadata } from "next";
import { format } from "date-fns";
import { db } from "@/lib/db";
import { OrderClient } from "@/components/admin/store/utils/order-client";
import { OrderColumn } from "@/components/admin/store/utils/columns";
import { formatter } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Store | Orders",
};

const OrdersPage = async ({ params }: { params: { storeId: string } }) => {
  const pageSize = 10;

  const orders = await db.order.findMany({
    where: { storeId: params.storeId },
    include: {
      orderProducts: {
        include: {
          variant: {
            include: {
              product: true,
              size: true,
              color: true,
              variantPrices: true,
            },
          },
        },
      },
    },
    take: pageSize,
    skip: 0,
    orderBy: { createdAt: "desc" },
  });

  const total = await db.order.count({
    where: { storeId: params.storeId },
  });

  const formattedOrders: OrderColumn[] = orders
    .map((item) => {
      const validOrderItems = item.orderProducts.filter(
        (orderItem) => orderItem.variantId && orderItem.variant
      );

      if (validOrderItems.length === 0) return null;

      return {
        id: item.id,
        phone: item.phone,
        address: item.address,
        isPaid: item.isPaid,
        status: item.status,
        orderNumber: item.orderNumber || "Pending",
        customerName: item.customerName || "-",
        customerEmail: item.customerEmail || "-",
        products: validOrderItems
          .map((orderItem) => {
            const v = orderItem.variant;
            return [
              v.name,
              v.size?.value ? `(${v.size.value}` : "",
              v.color?.name ? `${v.color.name})` : "",
            ]
              .filter(Boolean)
              .join(" ");
          })
          .join(", "),
        totalPrice: formatter.format(
          validOrderItems.reduce((sum, op) => {
            const price = op.variant.variantPrices[0]?.price || 0;
            return sum + price * op.quantity;
          }, 0)
        ),
        gstnumber: item.gstNumber || "Not provided",
        createdAt: format(item.createdAt, "MMMM do, yyyy"),
      };
    })
    .filter((order): order is any => order !== null);

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrderClient data={formattedOrders} initialRowCount={total} />
      </div>
    </div>
  );
};

export default OrdersPage;