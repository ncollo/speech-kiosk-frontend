import Navbar from './Navbar';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import SystemPreviewSection from './SystemPreviewSection';
import HowItWorks from './HowItWorks';
import AccessibilitySection from './AccessibilitySection';
import ImpactSection from './ImpactSection';
import Footer from './Footer';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="lp-container">
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <FeaturesSection />
        <SystemPreviewSection />
        <HowItWorks />
        <AccessibilitySection />
        <ImpactSection />
      </main>
      <Footer />
    </div>
  );
}
