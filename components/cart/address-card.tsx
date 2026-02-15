"use client";

import { useAddessModal } from "@/hooks/use-address-modal";
import { useCheckoutAddress } from "@/hooks/use-checkout-address";
import { cn } from "@/lib/utils";
import { Address } from "@prisma/client";
import { Check, Edit, MapPin, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import axios from "axios";

interface AddressCardProps {
  data: Address;
  onSelect?: (address: Address) => void;
  selectionMode?: boolean;
}

export const AddressCard = ({ data, onSelect, selectionMode = false }: AddressCardProps) => {
  const { address: selectedAddress } = useCheckoutAddress();
  const { onOpen, setAddress } = useAddessModal();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const isSelected = selectedAddress?.id === data.id;

  const handleCardClick = () => {
    if (selectionMode) return; // Don't trigger address selection in selection mode
    if (onSelect) {
      onSelect(data);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectionMode) return; // Disable edit in selection mode
    setAddress(data);
    onOpen();
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectionMode) return; // Disable delete in selection mode

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmDelete) return;

    setIsDeleting(true);

    try {
      await axios.delete(`/api/v1/address?id=${data.id}`);
      toast.success("Address deleted successfully");
      router.refresh();
      window.location.reload();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to delete address");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "relative border rounded-lg p-4 transition-all duration-200",
        selectionMode 
          ? "cursor-default" 
          : "cursor-pointer hover:shadow-md",
        isSelected && !selectionMode
          ? "border-orange-500 bg-orange-50 shadow-md"
          : "border-gray-200 hover:border-gray-300",
        selectionMode && "pl-14" // Add left padding for checkbox
      )}
    >
      {/* Selected Indicator */}
      {isSelected && !selectionMode && (
        <div className="absolute top-4 right-4 bg-orange-500 rounded-full p-1">
          <Check className="w-4 h-4 text-white" />
        </div>
      )}

      {/* Address Details */}
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              {data.name}
              {data.isDefault && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  Default
                </span>
              )}
            </h4>
            <p className="text-sm text-gray-600 mt-1">{data.phoneNumber}</p>
          </div>
        </div>

        <div className="flex items-start gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <p className="flex-1">
            {data.address}, {data.town}, {data.state} - {data.zipCode}
          </p>
        </div>

        {data.landmark && (
          <p className="text-sm text-gray-500 ml-6">
            Landmark: {data.landmark}
          </p>
        )}
      </div>

      {/* Action Buttons - Hide in selection mode */}
      {!selectionMode && (
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={handleEdit}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-md hover:bg-blue-50 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      )}
    </div>
  );
};