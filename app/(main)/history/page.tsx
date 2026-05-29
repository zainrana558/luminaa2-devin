import { cookies } from "next/headers";
import { getWatchHistory } from "@/actions/progress";
import HistoryClient from "@/components/browse/HistoryClient";

export default async function HistoryPage() {
  const cookieStore = await cookies();
  const profileId = cookieStore.get("profile_id")?.value;

  if (!profileId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Please select a profile first.</p>
      </div>
    );
  }

  const history = await getWatchHistory(profileId);

  return <HistoryClient items={history} profileId={profileId} />;
}
