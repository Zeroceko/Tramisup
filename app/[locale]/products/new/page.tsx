import { redirect } from "next/navigation";

/**
 * /products/new is superseded by /onboarding.
 * All product creation goes through the guided onboarding wizard.
 */
export default async function ProductsNewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/onboarding`);
}
