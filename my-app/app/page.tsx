import { clerkClient } from "@clerk/nextjs/server";
import { FeatureShowcase } from "../components/home/FeatureShowcase";
import { HeroSection } from "../components/home/HeroSection";
import { PricingPreview } from "../components/home/PricingPreview";
import { ReviewCarousel } from "../components/home/ReviewCarousel";

export default async function HomePage() {
  let userCount = 0;
  let avatars: string[] = [];

  try {
    const client = await clerkClient();
    userCount = await client.users.getCount();
    const latestUsers = await client.users.getUserList({
      limit: 6,
      orderBy: "-created_at",
    });
    avatars = latestUsers.data
      .map((u) => u.imageUrl)
      .filter((url): url is string => !!url && !url.includes("default-user-icon"));
  } catch (error) {
    console.error("Failed to fetch Clerk data for social proof:", error);
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 sm:gap-10 sm:py-12">
      <HeroSection userCount={userCount} avatars={avatars} />
      <FeatureShowcase />
      <PricingPreview />
      <ReviewCarousel />
    </div>
  );
}
