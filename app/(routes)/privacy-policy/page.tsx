import React from "react";
import { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
  parent: ResolvingMetadata
): Promise<Metadata> {
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: "Privacy Policy | Favobliss",
    description:
      "Privacy Policy of Favobliss Infotech Pvt Ltd. Learn how we collect, use, and protect your personal information when you visit or make a purchase from our website.",
    openGraph: {
      type: "website",
      images: [
        "https://favobliss.com/assets/favobliss-logo.jpg",
        ...previousImages,
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Privacy Policy | Favobliss",
      description:
        "Privacy Policy of Favobliss Infotech Pvt Ltd. Learn how we collect, use, and protect your personal information when you visit or make a purchase from our website.",
      images: [
        "https://favobliss.com/assets/favobliss-logo.jpg",
      ],
    },
    category: "ecommerce",
  };
}
const page = () => {
  const privacyPolicy = `
  This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from www.favobliss.com
 The Site is operated by Favobliss Infotech Pvt Ltd.
By using our website, you agree to the collection and use of information in accordance with this Privacy Policy.
Company Details
Business Name: Favobliss Infotech Pvt Ltd
Website: https://www.favobliss.com
Address:
245/49, 4th Floor, East School Block, Mandawali, Delhi – 110092
Email: support@favobliss.com
Phone: +91 9990343789
Personal Information We Collect
Device Information
When you visit the Site, we automatically collect certain information about your device, including:
Web browser type
IP address
Time zone
Cookies installed on your device
Pages or products viewed
Referring websites or search terms
Interaction with the Site
This information is referred to as Device Information.
Technologies Used
Cookies: Small data files stored on your device to improve browsing experience
Log files: Track actions on the Site, including IP address, browser type, date & time
Web beacons / pixels / tags: Used to analyze browsing behavior and website performance
Order Information
When you make or attempt to make a purchase through the Site, we collect:
Name
Shipping address
Billing address
Email address
Phone number
Order and delivery details
Currently, Favobliss supports Cash on Delivery (COD) only.
We do not collect or store credit/debit card details.
Personal Information
“Personal Information” includes both Device Information and Order Information.
 How We Use Your Personal Information
We use the collected information to:
Process and fulfill orders
Arrange delivery and order confirmation
Communicate with customers
Provide customer support
Screen orders for fraud or risk
Improve and optimize our website
Comply with legal and regulatory obligations
Analytics & Website Improvement
We use analytics tools (such as Google Analytics) to understand how customers interact with our Site and to improve user experience. These tools may collect Device Information but do not personally identify users.
🤝 Sharing Your Personal Information
We do not sell or rent your personal information.
We may share your information only with:
Delivery and logistics partners
Technology and support service providers
Government or legal authorities when required by law
All third parties are obligated to protect your data and use it only for authorized purposes.
Cookies
Cookies help us:
Remember items in your cart
Improve website functionality
Enhance user experience
You can control or disable cookies through your browser settings.
Please note that disabling cookies may limit certain features of the Site.

🔐 Data Security

We implement appropriate technical and organizational security measures, including:

SSL encryption

Secure servers

Restricted access to personal data

However, no method of transmission over the Internet is completely secure.

👤 Your Rights

You have the right to:

Access your personal information

Request correction or updates

Request deletion of data (subject to legal requirements)

To exercise these rights, contact us at support@favobliss.com
.

👶 Minor
The Site is not intended for individuals under the age of 18 years.
Minors may use the Site only under the supervision of a parent or legal guardian, as per Indian law.
Data Retention
We retain your order and personal information only as long as necessary to fulfill orders, comply with legal obligations, or resolve disputes.
 Changes to This Privacy Policy
We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.
Any updates will be posted on this page.
📞 Contact Us
For questions, concerns, or complaints regarding this Privacy Policy, please contact:
Favobliss Infotech Pvt Ltd
📍 245/49, 4th Floor, East School Block, Mandawali, Delhi – 110092
📧 support@favobliss.com
📞 +91 9990343789

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
      <h1 className="text-3xl font-bold mt-10">Favobliss Privacy Policy</h1>

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
