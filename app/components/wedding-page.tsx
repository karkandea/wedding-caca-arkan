import DeferredWeddingSections from "./deferred-wedding-sections";
import FloatingSectionNav from "./floating-section-nav";
import NewHeroSection from "./new-hero-section";

type WeddingPageProps = {
  guestName?: string;
};

export default function WeddingPage({ guestName }: WeddingPageProps) {
  return (
    <>
      <FloatingSectionNav />
      <main className="flex flex-1 flex-col">
        <NewHeroSection />
        <DeferredWeddingSections guestName={guestName} />
      </main>
    </>
  );
}
