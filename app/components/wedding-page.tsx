import DeferredWeddingSections from "./deferred-wedding-sections";
import FloatingSectionNavLoader from "./floating-section-nav-loader";
import NewHeroSection from "./new-hero-section";
import ScrollToHeroOnLoad from "./scroll-to-hero-on-load";

type WeddingPageProps = {
  guestName?: string;
};

export default function WeddingPage({ guestName }: WeddingPageProps) {
  return (
    <>
      <ScrollToHeroOnLoad />
      <FloatingSectionNavLoader />
      <main className="flex flex-1 flex-col">
        <NewHeroSection />
        <DeferredWeddingSections guestName={guestName} />
      </main>
    </>
  );
}
