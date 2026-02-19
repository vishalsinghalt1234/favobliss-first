"use client";

import { AddressForm } from "@/components/cart/address-form";
import { AddressSkeleton } from "@/components/cart/address-skeleton";
import { Summary } from "@/components/cart/summary";
import { UserAddressCard } from "@/components/cart/user-address-card";
import { Container } from "@/components/ui/container";
import { useAddress } from "@/hooks/use-address";
import { useCheckoutAddress } from "@/hooks/use-checkout-address";
import { useCart } from "@/hooks/use-cart";
import { Address } from "@prisma/client";
import { AlertTriangle } from "lucide-react";
import { useMemo } from "react";

const cleanPincode = (pin: any) => String(pin).replace(/\D/g, "").trim();

const CheckoutAddressClient = () => {
  const { data, isLoading }: { data: Address[]; isLoading: boolean } =
    useAddress();
  const { items } = useCart();
  const { address } = useCheckoutAddress();
  const unavailableItems = useMemo(() => {
    if (!address || items.length === 0) return [];
    const shippingPin = cleanPincode(address.zipCode);
    return items.filter(
      (item) => cleanPincode(item.pincode) !== shippingPin,
    );
  }, [address, items]);

  const isAddressCorrect = unavailableItems.length === 0;

  return (
    <Container>
      <div className="px-4 sm:px-6 lg:px-8 xl:px-24 h-full">
        <div className="my-12 lg:grid lg:grid-cols-12 lg:items-start gap-x-12">
          <div className="lg:col-span-7 space-y-4">
            {!isAddressCorrect && address && (
              <div className="rounded-lg border border-amber-300 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-amber-800">
                      Some items are not available at{" "}
                      <span className="font-bold">
                        {cleanPincode(address.zipCode)}
                      </span>
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {unavailableItems.map((item) => (
                        <li
                          key={item.id}
                          className="text-sm text-amber-700"
                        >
                          •{" "}
                          <span className="font-medium">
                            {item.selectedVariant.name}
                            {item.selectedVariant.size ? ` – ${item.selectedVariant.size}` : ""}
                            {item.selectedVariant.color ? ` / ${item.selectedVariant.color}` : ""}
                          </span>{" "}
                          <span className="text-amber-500 text-xs">
                            (priced for {cleanPincode(item.pincode)})
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-amber-600 pt-1">
                      Please select a different address or remove these items to
                      proceed.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isLoading ? (
              <AddressSkeleton />
            ) : data?.length === 0 ? (
              <AddressForm />
            ) : (
              <UserAddressCard data={data} />
            )}
          </div>

          <div className="flex flex-col gap-y-8 w-full lg:col-span-5 lg:mt-0 mt-16">
            <Summary isAddressCorrect={isAddressCorrect} />
          </div>
        </div>
      </div>
    </Container>
  );
};

export default CheckoutAddressClient;