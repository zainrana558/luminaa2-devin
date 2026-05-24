export async function fetchConsumet(endpoint: string) {
  try {
    const base = process.env.CONSUMET_API_URL ?? "https://api.consumet.org";
    const res = await fetch(`${base}${endpoint}`, {
      next: { revalidate: 1800 },
    });
    if (!res.ok) throw new Error("Consumet failed");
    return await res.json();
  } catch {
    return null;
  }
}
