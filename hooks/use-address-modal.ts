import { Address } from "@prisma/client";
import { create } from "zustand";

interface UseAddressModal {
    isOpen: boolean;
    address: Address | null;
    onOpen: () => void;
    onClose: () => void;
    setAddress: (address: Address | null) => void;
}

export const useAddessModal = create<UseAddressModal>((set) => ({
    isOpen: false,
    address: null,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false, address: null }),
    setAddress: (address) => set({ address }),
}));