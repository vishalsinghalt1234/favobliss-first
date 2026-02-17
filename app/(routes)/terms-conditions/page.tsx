import React from "react";
import { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
) {

  return {
    title: "Terms & Condition | Favobliss",
    description:
      "Terms & Condition of Favobliss Infotech Pvt Ltd. Read our terms and conditions for using our website, placing orders, and understanding your rights and responsibilities as a customer.",
    openGraph: {
      type: "website",
      images: [
        "https://favobliss.com/assets/favobliss-logo.jpg",
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Terms & Condition | Favobliss",
      description:
        "Terms & Condition of Favobliss Infotech Pvt Ltd. Read our terms and conditions for using our website, placing orders, and understanding your rights and responsibilities as a customer.",
      images: [
        "https://favobliss.com/assets/favobliss-logo.jpg",
      ],
    },
    category: "ecommerce",
  };
}
const page = () => {
  const terms = `
  Welcome to Favobliss. These Terms & Conditions govern your access to and use of our website www.favobliss.com operated by Favobliss Infotech Pvt Ltd. By using our website or placing an order, you agree to be bound by these terms.
About the Company
Business Name: Favobliss Infotech Pvt Ltd
Website: www.favobliss.com
Registered Address:
245/49, 4th Floor, East School Block, Mandawali, Delhi – 110092
Email: support@favobliss.com
Phone: +91 9990343789
Products & Services
Favobliss deals in home appliances and kitchen appliances, including but not limited to ACs, refrigerators, washing machines, fans, air purifiers, irons, and related products.
All product images are for illustration purposes only. Actual product appearance may vary based on manufacturer specifications.
Payment Terms
Currently, Cash on Delivery (COD) is the only accepted payment method.
Customers must pay the exact order amount at the time of delivery.
Online prepaid payment methods may be introduced in the future.
Delivery Policy
We provide free delivery across Delhi & NCR.
Most orders are delivered within 48 hours, subject to stock availability and serviceable locations.
Delivery timelines may vary due to unforeseen circumstances such as weather, traffic, or logistical issues.
Returns, Replacements & Refunds
Returns, replacements, and refunds are governed by our Payment & Return Policy.
Customers are advised to read the policy carefully before placing an order.
Recording an unboxing video is mandatory for any return or replacement request.
Unboxing & Product Inspection
Customers must inspect the product at the time of delivery.
Any damage, defect, or mismatch must be reported within the specified time period along with video/image proof.
Requests without proper proof may be rejected.
Order Cancellation
Orders once confirmed may not be cancelled after dispatch.
Favobliss reserves the right to cancel any order due to stock unavailability, pricing errors, or unforeseen issues. In such cases, the customer will be informed accordingly.
User Responsibilities
Customers must provide accurate contact, address, and delivery information.
Favobliss will not be responsible for delays or failures caused by incorrect information provided by the customer.
Intellectual Property

All content on this website, including logos, images, text, and design, is the property of Favobliss Infotech Pvt Ltd.
Unauthorized use, copying, or reproduction is strictly prohibited.
Limitation of Liability

Favobliss shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or products.
Liability, if any, shall be limited to the value of the product purchased.
hanges to Terms
Favobliss reserves the right to modify or update these Terms & Conditions at any time without prior notice.
Continued use of the website after changes implies acceptance of the updated terms.
Governing Law
These Terms & Conditions shall be governed by and interpreted in accordance with the laws of India.
Any disputes shall be subject to the jurisdiction of Delhi courts only.
📞 Contact Information
For any questions regarding these Terms & Conditions, please contact:
Favobliss Infotech Pvt Ltd
📍 245/49, 4th Floor, East School Block, Mandawali, Delhi – 110092
📞 +91 9990343789
📧 support@favobliss.com

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
      <h1 className="text-3xl font-bold mt-10">Favobliss Terms & Conditions</h1>

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
