import React from "react";
import { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
  parent: ResolvingMetadata
): Promise<Metadata> {
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: "About Us | Favobliss",
    description:
      "Welcome to Favobliss, a trusted e-commerce brand owned and operated by Favobliss Infotech Pvt Ltd. Favobliss is a registered trademark of Favobliss Infotech Pvt Ltd, and we have been proudly serving customers since 2015.",
    openGraph: {
      type: "website",
      images: [
        "https://favobliss.com/assets/favobliss-logo.jpg",
        ...previousImages,
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "About Us | Favobliss",
      description:
        "Welcome to Favobliss, a trusted e-commerce brand owned and operated by Favobliss Infotech Pvt Ltd. Favobliss is a registered trademark of Favobliss Infotech Pvt Ltd, and we have been proudly serving customers since 2015.",
      images: [
        "https://favobliss.com/assets/favobliss-logo.jpg",
      ],
    },
    category: "ecommerce",
  };
}

const page = () => {
  const privacyPolicy =`
  Welcome to Favobliss, a trusted e-commerce brand owned and operated by Favobliss Infotech Pvt Ltd. Favobliss is a registered trademark of Favobliss Infotech Pvt Ltd, and we have been proudly serving customers since 2015. Based in India, we are committed to delivering genuine products, fair pricing, and dependable service through our official website https://favobliss.com/
We specialize in a comprehensive range of home appliances and kitchen appliances, including air conditioners, refrigerators, washing machines, fans, air purifiers, irons, and other essential household products. Our aim is to bring modern technology and everyday comfort to homes while maintaining high standards of quality and reliability.
At Favobliss, we strongly believe that customers deserve the best prices without compromising on product quality. We work with authorized distributors and trusted supply partners to ensure that all products sold on our platform are authentic and, wherever applicable, backed by manufacturer warranty.
Transparency is the foundation of our business. All product details, pricing, availability, shipping timelines, and return or refund policies are clearly mentioned on our website, allowing customers to shop with complete confidence and clarity.
We deliver top-quality products and the latest technology directly to homes across Delhi and NCR, offering free delivery with most orders delivered within 48 hours. Our dedicated customer support team is available to assist customers before and after purchase, ensuring a smooth, secure, and reliable shopping experience. For any assistance, customers can reach us at support@favobliss.com
With years of industry experience, Favobliss Infotech Pvt Ltd continues to grow with a focus on customer satisfaction, ethical business practices, and continuous improvement. Thank you for choosing Favobliss  your trusted destination for quality home and kitchen appliances at the right price.
📞 Contact Us
At Favobliss, customer trust and transparency are our top priorities. If you have any questions related to products, pricing, orders, delivery, installation, or after-sales support, please feel free to contact us using the details below. Our support team will be happy to assist you.
Business Information
Legal Business Name:
Favobliss Infotech Pvt. Ltd.
Brand Name:
Favobliss® (Trademark Available)
📍 Office Address
245/49, 4th Floor,
East School Block, Mandawali,
Delhi – 110092,
India
📞 Phone
+91 9990343789
(Customer Support – Call during business hours)
📧 Email
support@favobliss.com
🌐 Website
https://www.favobliss.com
Business Hours
Monday to Sunday
10:00 AM – 7:00 PM

  `.trim();
  const formatPolicy = (raw: string) => {
    const headings = new Set([
      "FAVOBLISS PRIVACY POLICY",
      "WHAT PERSONAL INFORMATION ABOUT CUSTOMERS DO WE COLLECT?",
      "INFORMATION YOU GIVE US",
      "AUTOMATIC INFORMATION",
      "E-MAIL COMMUNICATIONS",
      "INFORMATION FROM OTHER SOURCES",
      "WHAT ABOUT COOKIES?",
      "DOES FAVOBLISS SHARE THE INFORMATION IT RECEIVES?",
      "HOW SECURE IS INFORMATION ABOUT ME?",
      "WHAT ABOUT THIRD-PARTY ADVERTISERS AND LINKS TO OTHER WEB SITES?",
      "WHAT INFORMATION CAN I ACCESS?",
      "WHAT CHOICES DO I HAVE?",
      "ARE CHILDREN ALLOWED TO USE FAVOBLISS.COM?",
      "NOTICES AND REVISIONS",
      "EXAMPLES OF INFORMATION COLLECTED",
      "INFORMATION YOU GIVE US",
      "AUTOMATIC INFORMATION",
      "INFORMATION YOU CAN ACCESS",
    ]);

    return raw.split("\n").map((line, idx) => {
      const text = line.trim();

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
      if (text.length <= 50 && text === text.toUpperCase()) {
        return (
          <h3
            key={idx}
            className="mt-4 mb-1 text-base font-semibold text-gray-900"
          >
            {text}
          </h3>
        );
      }

      return (
        <p key={idx} className="text-sm md:text-base leading-7 text-gray-700">
          {text}
        </p>
      );
    });
  };

  return (
    <div className="w-full flex flex-col text-center items-center justify-center mb-8">
      <h1 className="text-3xl font-bold mt-10">About Us</h1>

      {/* Added: content container */}
      <div className="w-full max-w-5xl mt-6 px-4">
        <div className="text-left bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-5 md:px-8 py-6 max-h-[75vh] overflow-y-auto">
            {formatPolicy(privacyPolicy)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
