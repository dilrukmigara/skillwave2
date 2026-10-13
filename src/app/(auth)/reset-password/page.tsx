import { AuthPage } from "@/components/auth/AuthPage";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;
  return <AuthPage role="student" mode="reset" notice={notice} />;
}
