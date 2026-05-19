import type { Metadata } from "next";
import WeddingPage from "../components/wedding-page";

const DEFAULT_GUEST_NAME = "Novan & Partner";

function formatGuestName(slug: string) {
  const decoded = decodeURIComponent(slug)
    .replace(/\+/g, " ")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return decoded || DEFAULT_GUEST_NAME;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ guest: string }>;
}): Promise<Metadata> {
  const { guest } = await params;
  const guestName = formatGuestName(guest);

  return {
    title: `Salsa & Arkan - ${guestName}`,
  };
}

export default async function GuestInvitationPage({
  params,
}: {
  params: Promise<{ guest: string }>;
}) {
  const { guest } = await params;
  const guestName = formatGuestName(guest);

  return <WeddingPage guestName={guestName} />;
}
