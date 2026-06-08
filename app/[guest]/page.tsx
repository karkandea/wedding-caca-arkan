import type { Metadata } from "next";
import WeddingPage from "../components/wedding-page";

const DEFAULT_GUEST_NAME = "Novan & Partner";
const SITE_TITLE = "Wedding of Salsa & Arkan";
const SITE_DESCRIPTION = "Kami mengundang Anda untuk hadir di hari istimewa kami - 21 Juni 2026, Padang";
const PREVIEW_IMAGE = "https://wedding.dualangka.com/image.png";

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
  await params;

  return {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    openGraph: {
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      images: [
        {
          url: PREVIEW_IMAGE,
          alt: SITE_TITLE,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: SITE_TITLE,
      description: SITE_DESCRIPTION,
      images: [PREVIEW_IMAGE],
    },
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
