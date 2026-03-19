import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SettingsForm from "@/components/SettingsForm";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  const userWithProducts = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    include: { products: { take: 1 } },
  });

  const user = userWithProducts ? {
    ...userWithProducts,
    product: userWithProducts.products[0] || null,
  } : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">
          Manage your account and project settings
        </p>
      </div>

      <SettingsForm user={user} />
    </div>
  );
}
