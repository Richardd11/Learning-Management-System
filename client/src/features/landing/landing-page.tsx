import { Suspense, lazy } from "react";
import { NavBar } from "./components/nav-bar";
import { Hero } from "./components/hero";
import { FeaturesBento } from "./components/features-bento";

const RoleTabs = lazy(() =>
  import("./components/role-tabs").then((m) => ({ default: m.RoleTabs }))
);
const HowItWorks = lazy(() =>
  import("./components/how-it-works").then((m) => ({ default: m.HowItWorks }))
);
const CtaBanner = lazy(() =>
  import("./components/cta-banner").then((m) => ({ default: m.CtaBanner }))
);
const SiteFooter = lazy(() =>
  import("./components/site-footer").then((m) => ({ default: m.SiteFooter }))
);

function SectionFallback() {
  return <div className="py-24 px-4" />;
}

export function LandingPage() {
  return (
    <div className="overflow-x-clip">
      <NavBar />
      <main id="main-content">
        <Hero />
        <FeaturesBento />
        <Suspense fallback={<SectionFallback />}>
          <RoleTabs />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <HowItWorks />
        </Suspense>
        <Suspense fallback={<SectionFallback />}>
          <CtaBanner />
        </Suspense>
      </main>
      <Suspense fallback={<SectionFallback />}>
        <SiteFooter />
      </Suspense>
    </div>
  );
}
