import { getBlogs } from "@/actions/get-blogs";
import BlogList from "@/components/BlogsEditor/BlogList";
import { Metadata } from "next";

interface Props {
  searchParams: { page?: string };
}

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Blog | FavoBliss – Fashion Tips, Trends & Style Guides",
  description:
    "Explore the latest fashion trends, styling tips, product guides, and lifestyle articles from FavoBliss. Stay updated with what's new in ethnic wear, western wear & more.",
  keywords: "fashion blog, style tips, ethnic wear trends, favobliss blog, indian fashion",
  openGraph: {
    title: "FavoBliss Blog – Latest Fashion Trends & Style Inspiration",
    description:
      "Discover expert fashion advice, new arrivals, festive looks, care guides and more on the FavoBliss blog.",
    url: "https://favobliss.com/blog",
    images: [
      {
        url: "https://images.favobliss.com/images/1600w-wqy-jynprm8-inrke0.webp",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    canonical: "https://favobliss.com/blog",
  },
};

export default async function BlogPage({ searchParams }: Props) {
  const page = Number(searchParams.page) || 1;
  const limit = 9;

  const data = await getBlogs(page, limit);
  const publishedBlogs = data.blogs.filter((b:any) => b.published);

  return (
    <BlogList
      initialBlogs={publishedBlogs}
      currentPage={page}
      totalBlogs={data.total}
      limit={limit}
    />
  );
}
