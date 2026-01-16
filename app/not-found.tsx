/**
 * 404 Not Found Page
 */

import Link from "next/link";
import { preserveToken } from "@/lib/utils/preserve-token";
import { getTokenFromSearchParams } from "@/lib/utils/preserve-token";

interface NotFoundPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function NotFoundPage({
  searchParams,
}: NotFoundPageProps) {
  const params = await searchParams;
  const token = params ? getTokenFromSearchParams(params) : null;

  return (
    <div className="flex flex-col items-center justify-center my-10">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link href={preserveToken("/", token)}>Go to Dashboard</Link>
    </div>
  );
}
