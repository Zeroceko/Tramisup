import PricingContent from "@/components/PricingContent";

export default async function PricingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ next?: string }>;
}) {
  const { locale } = await params;
  const { next } = await searchParams;
  const safeNext = (next ?? "").startsWith("/") && !(next ?? "").startsWith("//") ? (next ?? "") : "";
  return <PricingContent locale={locale} next={safeNext} />;
}
