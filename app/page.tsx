import { redirect } from "next/navigation";

interface HomeProps {
  searchParams: Promise<{
    token?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  // Redirect to dashboard by default, preserving token query parameter
  const params = await searchParams;
  const token = params.token;
  const redirectUrl = token
    ? `/dashboard?token=${encodeURIComponent(token)}`
    : "/dashboard";
  redirect(redirectUrl);
}
