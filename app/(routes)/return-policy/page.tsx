import React from "react";
import { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
  parent: ResolvingMetadata
): Promise<Metadata> {
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: "Return Policy | Favobliss",
    description:
      "Return Policy of Favobliss Infotech Pvt Ltd. Learn about our return and refund policies for products purchased from our website.",
    openGraph: {
      type: "website",
      images: [
        "https://favobliss.com/assets/favobliss-logo.jpg",
        ...previousImages,
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Return Policy | Favobliss",
      description:
        "Return Policy of Favobliss Infotech Pvt Ltd. Learn about our return and refund policies for products purchased from our website.",
      images: [
        "https://favobliss.com/assets/favobliss-logo.jpg",
      ],
    },
    category: "ecommerce",
  };
}
const page = () => {
  const terms = `
At Favobliss, customer satisfaction is our priority. We follow a transparent and structured return, replacement, and refund process to ensure a smooth experience for our customers.
Return / Refund Window
Products are eligible for return, replacement, or refund within 10 days from the date of delivery.
Requests raised after this period will not be accepted.
Refund Processing
Refunds (if applicable) are initiated after successful pickup and verification of the product.
Once approved, the refund will be processed within 5–7 working days.
The maximum time for completing any return, replacement, or refund request is up to 10 days.
Mandatory Unboxing Video (Important)
To ensure transparency and prevent misuse:
Customers must record a clear unboxing video while opening the package.
The video must clearly show:
Sealed package
Product condition
Any damage, defect, or mismatch (if present)
Please email the unboxing video to support@favobliss.com
 as per company policy.
⚠️ Without an unboxing video, return or replacement requests may be rejected.

How to Raise a Return / Replacement / Refund Request
Log in to your Favobliss account
Go to My Orders
Click on Return
Select the appropriate reason for return
Choose one of the available options:
Available Options
Exchange
Exchange the product for a new identical item (size/color/model where applicable).
Replacement
Replace the product if it is damaged, defective, broken, or not functioning properly.
Refund
If the product or preferred variant is unavailable or out of stock, you may opt for a refund.
 Verification Process
All return requests are subject to verification.
Customers must keep the following items ready:
Original invoice
Original packaging
Price tags
Accessories, manuals, freebies (if any)

Damaged / Defective / Wrong Product
If you receive a damaged, defective, or mismatched product, please inform us within 24 hours of delivery.
Email us clear images and video proof at support@favobliss.com
Replacement requests must be raised within 5 days of delivery.
Special Category – TV & Mobile Phones
For TVs and Mobile Phones, our delivery executive may provide on-site unboxing assistance.
Pickup and delivery for exchanges or replacements will be scheduled together.
Pickup & Replacement
In case of replacements or exchanges, pickup and delivery are coordinated simultaneously.
Final approval is subject to Favobliss return and replacement guidelines.
🤝 Our Commitment
All requests are handled strictly according to Favobliss’s Return & Replacement Guarantee, ensuring fairness, transparency, and customer trust.
Need Help?
For any assistance, feel free to contact us at:
Email: support@favobliss.com
Phone: +91 9990343789

  `.trim();

  const formatTerms = (raw: string) => {
    const headings = new Set([
      "ACCESS TO THE APP",
      "ELIGIBILITY",
      "COMPLIANCE REQUIREMENTS",
      "USER ACCOUNT",
      "PAYMENT POLICY",
      "DELIVERY POLICY",
      "RETURN POLICY",
      "ORDER CANCELLATION POLICY",
      "REFUND POLICY",
    ]);

    return raw.split("\n").map((line, idx) => {
      const text = line.trim();

      // blank line spacing
      if (!text) return <div key={idx} className="h-3" />;

      // numbered list item
      if (/^\d+\.\s+/.test(text)) {
        return (
          <p key={idx} className="text-sm md:text-base leading-7 text-gray-700">
            {text}
          </p>
        );
      }

      // main headings
      if (headings.has(text.toUpperCase())) {
        return (
          <h2
            key={idx}
            className="mt-6 mb-2 text-lg md:text-xl font-semibold text-gray-900"
          >
            {text}
          </h2>
        );
      }

      // sub headings (simple heuristic)
      if (text.length <= 40 && text === text.toUpperCase()) {
        return (
          <h3 key={idx} className="mt-4 mb-1 text-base font-semibold text-gray-900">
            {text}
          </h3>
        );
      }

      // normal paragraph
      return (
        <p key={idx} className="text-sm md:text-base leading-7 text-gray-700">
          {text}
        </p>
      );
    });
  };

  return (
    <div className="w-full flex flex-col text-center items-center justify-center mb-8">
      <h1 className="text-3xl font-bold mt-10">Favobliss Return & Refund Policy</h1>

      {/* Added: content container */}
      <div className="w-full max-w-5xl mt-6 px-4">
        <div className="text-left bg-white rounded-xl border border-gray-200 shadow-sm">
         

          <div className="px-5 md:px-8 py-6 max-h-[75vh] overflow-y-auto">
            {formatTerms(terms)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
