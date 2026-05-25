import DeferredWeddingSections from "./deferred-wedding-sections";
import NewHeroSection from "./new-hero-section";

type WeddingPageProps = {
  guestName?: string;
};

export default function WeddingPage({ guestName }: WeddingPageProps) {
  return (
    <>
      <main className="flex flex-1 flex-col">
        <NewHeroSection />
        <DeferredWeddingSections guestName={guestName} />
      </main>
    </>
  );
}
