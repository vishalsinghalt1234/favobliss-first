import CheckoutAddressClient from "@/components/checkoutAddressClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout – Delivery Address | FavoBliss",
  description:
    "Select or add delivery address to complete your order securely.",
  robots: { index: false },
};

export default function CheckoutAddressPage() {
  <CheckoutAddressClient />;
}
