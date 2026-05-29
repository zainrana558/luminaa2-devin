import { cookies } from "next/headers";
import { getWatchlist } from "@/actions/watchlist";
import MyListClient from "@/components/browse/MyListClient";

export default async function MyListPage() {
  const cookieStore = await cookies();
  const profileId = cookieStore.get("profile_id")?.value;

  if (!profileId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Please select a profile first.</p>
      </div>
    );
  }

  const watchlist = await getWatchlist(profileId);

  return <MyListClient items={watchlist} profileId={profileId} />;
}
