import CartClient from "@/components/cartClient";
import { Metadata } from "next"; 

export const metadata: Metadata = {
  title: "Your Shopping Cart | FavoBliss",
  description: "Review and manage items in your cart before secure checkout at FavoBliss.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Shopping Cart – FavoBliss",
    description: "Complete your purchase securely.",
    images: ["https://www.electrax.in/assets/logo.jpg"], 
  },
};

export default function CartPage() {
  return <CartClient />;
}