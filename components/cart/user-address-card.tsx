"use client";

import { Address } from "@prisma/client";
import { AddressCard } from "./address-card";
import { useAddessModal } from "@/hooks/use-address-modal";
import { useCart } from "@/hooks/use-cart";
import { useCheckoutAddress } from "@/hooks/use-checkout-address";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useMemo, useState } from "react";
import { getProducts } from "@/actions/get-products";
import { useCheckout } from "@/hooks/use-checkout";
import { Check, Trash2, X } from "lucide-react";
import axios from "axios";

interface UserAddressCardProps {
  data: Address[];
  label?: boolean;
}

interface PricingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  mismatchedCount: number;
  newPincode: string;
  isLoading: boolean;
}

const PricingDialog = ({
  isOpen,
  onClose,
  onConfirm,
  mismatchedCount,
  newPincode,
  isLoading,
}: PricingDialogProps) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-amber-100 rounded-full">
            <svg
              className="w-6 h-6 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 19c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
            Update Cart Prices?
          </h3>

          <p className="text-sm text-gray-600 text-center mb-6">
            <span className="font-medium">{mismatchedCount} item(s)</span> in
            your cart were added for a different pincode. Update prices for{" "}
            <span className="font-medium">{newPincode}</span>?
          </p>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-400 border border-transparent rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Updating...
                </>
              ) : (
                "Update Prices"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const UserAddressCard = ({ data, label }: UserAddressCardProps) => {
  const { onOpen } = useAddessModal();
  const { items, updateItemPrice, removeItem } = useCart();
  const { addAddress, address: selectedAddress } = useCheckoutAddress();
  const router = useRouter();
  const [showPricingDialog, setShowPricingDialog] = useState(false);
  const [selectedTempAddress, setSelectedTempAddress] =
    useState<Address | null>(null);
  const [mismatchedItems, setMismatchedItems] = useState<any[]>([]);
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);
  const { updateItemCheckoutPrice } = useCheckout();

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedAddresses, setSelectedAddresses] = useState<Set<string>>(
    new Set(),
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const cleanPincode = (pin: any) => String(pin).replace(/\D/g, "").trim();

  const defaultAddress = useMemo(
    () => data?.find((address) => address.isDefault),
    [data],
  );

  useEffect(() => {
    if (!defaultAddress || selectedTempAddress) return;
    if (selectedAddress?.id === defaultAddress.id) return;

    addAddress(defaultAddress);
  }, [defaultAddress, selectedAddress?.id, addAddress]);

  const otherAddresses = useMemo(
    () => data?.filter((address) => !address.isDefault) ?? [],
    [data],
  );

  const handleAddressSelect = async (address: Address) => {
    if (selectionMode) {
      toggleAddressSelection(address.id);
      return;
    }

    console.log("not", address);
    console.log("selectd", items);

    const mismatched = items.filter((item) => {
      const isMismatch =
        cleanPincode(item.pincode) !== cleanPincode(address.zipCode);
      return isMismatch;
    });

    console.log("mis",mismatched);

    if (mismatched.length === 0) {
      addAddress(address);
      return;
    }

    setSelectedTempAddress(address);
    setMismatchedItems(mismatched);
    setShowPricingDialog(true);
  };

  const handlePriceUpdate = async () => {
    if (!selectedAddress || mismatchedItems.length === 0) return;

    setIsUpdatingPrices(true);

    try {
      const { products: response } = await getProducts({
        variantIds: mismatchedItems.map((item) => item.selectedVariant.id),
        pincode: Number(cleanPincode(selectedAddress.zipCode)),
      });

      

      for (const item of mismatchedItems) {
        const product = response.find((p) =>
          p.variants?.some((v: any) => v.id === item.selectedVariant.id),
        );

        const variant = product?.variants.find(
          (v: any) => v.id === item.selectedVariant.id,
        );

        const targetPincode = cleanPincode(selectedTempAddress?.zipCode);

        const variantPrice = variant?.variantPrices?.find((vp: any) => {
          const apiPincode = vp?.locationGroup?.locations?.find(
            (loc: any) => cleanPincode(loc.pincode) === targetPincode,
          )?.pincode;
          return cleanPincode(apiPincode) === targetPincode;
        });

        if (variantPrice && variantPrice.price) {
          updateItemPrice(
            item.selectedVariant.id,
            variantPrice.price,
            variantPrice.mrp,
            String(selectedAddress.zipCode),
            variantPrice.locationGroup?.deliveryDays || 0,
            variantPrice.locationGroup?.isCodAvailable || false,
          );

          updateItemCheckoutPrice(
            item.selectedVariant.id,
            variantPrice.price,
            variantPrice.mrp,
            String(selectedAddress.zipCode),
          );
          toast.success(`Updated price for ${targetPincode}`);
        } else {
          toast.warning(
            `The product is unavailable at this location (${selectedAddress.zipCode})`,
          );
        }
      }

      if (items.length > 0 && selectedTempAddress) {
        addAddress(selectedTempAddress);
      } else {
        toast.error(
          "All items were removed from the cart. Please add items again.",
        );
      }

      setShowPricingDialog(false);
    } catch (error: any) {
      console.error("Error details:", error);
      if (error?.response?.status === 404) {
        toast.error(
          "The entered pincode is invalid. Please enter a valid pincode or select a different address.",
        );
        setSelectedTempAddress(null);
      } else {
        toast.error("Failed to update prices for selected address");
      }
      console.error(error);
    } finally {
      setIsUpdatingPrices(false);
    }
  };

  const handleDialogClose = () => {
    setShowPricingDialog(false);
    setSelectedTempAddress(null);
    setMismatchedItems([]);
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedAddresses(new Set());
  };

  const toggleAddressSelection = (addressId: string) => {
    console.log("first here", addressId);
    const newSelected = new Set(selectedAddresses);
    if (newSelected.has(addressId)) {
      newSelected.delete(addressId);
    } else {
      newSelected.add(addressId);
    }
    setSelectedAddresses(newSelected);
  };

  const selectAll = () => {
    const allIds = new Set(data.map((addr) => addr.id));
    setSelectedAddresses(allIds);
  };

  const deselectAll = () => {
    setSelectedAddresses(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedAddresses.size === 0) {
      toast.error("Please select at least one address to delete");
      return;
    }

    const defaultSelected =
      defaultAddress && selectedAddresses.has(defaultAddress.id);
    if (defaultSelected && selectedAddresses.size === data.length) {
      toast.error("Cannot delete all addresses including the default address");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${selectedAddresses.size} address(es)?`,
    );

    if (!confirmDelete) return;

    setIsDeleting(true);

    try {
      const addressIds = Array.from(selectedAddresses);

      await Promise.all(
        addressIds.map((id) => axios.delete(`/api/v1/address?id=${id}`)),
      );

      toast.success(`Successfully deleted ${addressIds.length} address(es)`);

      window.location.reload();

      setSelectedAddresses(new Set());
      setSelectionMode(false);
    } catch (error) {
      console.error("Bulk delete error:", error);
      toast.error("Failed to delete some addresses. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="p-4 w-full rounded-sm space-y-6">
        {/* Bulk Actions Header - Only show on label page (My Address page) */}
        {label && data.length > 0 && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg md:text-xl font-bold text-zinc-800">
              My Addresses
            </h3>
            <div className="flex items-center gap-2">
              {selectionMode ? (
                <>
                  <button
                    onClick={deselectAll}
                    className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    Deselect All
                  </button>
                  <button
                    onClick={selectAll}
                    className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={selectedAddresses.size === 0 || isDeleting}
                    className="flex items-center gap-2 text-sm text-white bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    {isDeleting
                      ? "Deleting..."
                      : `Delete (${selectedAddresses.size})`}
                  </button>
                  <button
                    onClick={toggleSelectionMode}
                    className="flex items-center gap-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 px-4 py-1.5 rounded-md transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={toggleSelectionMode}
                  className="flex items-center gap-2 text-sm text-white bg-zinc-800 hover:bg-zinc-900 px-4 py-1.5 rounded-md transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Select Multiple
                </button>
              )}
            </div>
          </div>
        )}

        {data.length > 1 && !label && (
          <h3 className="text-lg md:text-xl font-bold text-zinc-800">
            Select Address
          </h3>
        )}

        {defaultAddress && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-600">
              DEFAULT ADDRESS
            </h3>
            <div className="relative">
              {selectionMode && (
                <div className="absolute left-4 top-4 z-10">
                  <input
                    type="checkbox"
                    checked={selectedAddresses.has(defaultAddress.id)}
                    onChange={() => toggleAddressSelection(defaultAddress.id)}
                    className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                  />
                </div>
              )}
              <AddressCard
                data={defaultAddress}
                onSelect={handleAddressSelect}
                selectionMode={selectionMode}
              />
            </div>
          </div>
        )}

        {otherAddresses.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-600">
              OTHER ADDRESSES
            </h3>
            {otherAddresses.map((address) => (
              <div key={address.id} className="relative">
                {selectionMode && (
                  <div className="absolute left-4 top-4 z-10">
                    <input
                      type="checkbox"
                      checked={selectedAddresses.has(address.id)}
                      onChange={() => toggleAddressSelection(address.id)}
                      className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer"
                    />
                  </div>
                )}
                <AddressCard
                  data={address}
                  onSelect={handleAddressSelect}
                  selectionMode={selectionMode}
                />
              </div>
            ))}
          </div>
        )}

        <div
          className="w-full aspect-[6/1] border border-dashed rounded-md flex items-center justify-center bg-gray-100 cursor-default md:cursor-pointer"
          onClick={onOpen}
        >
          <p className="text-md font-bold">Add New Address</p>
        </div>
      </div>

      <PricingDialog
        isOpen={showPricingDialog}
        onClose={handleDialogClose}
        onConfirm={handlePriceUpdate}
        mismatchedCount={mismatchedItems.length}
        newPincode={selectedAddress ? String(selectedAddress.zipCode) : ""}
        isLoading={isUpdatingPrices}
      />
    </>
  );
};
