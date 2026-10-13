import { AuthPage } from "@/components/auth/AuthPage";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ notice?: string }>;
}) {
  const { notice } = await searchParams;
  return <AuthPage role="superadmin" mode="login" notice={notice} />;
}
