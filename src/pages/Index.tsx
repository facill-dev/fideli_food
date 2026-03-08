import Header from "@/components/store/Header";
import HeroSection from "@/components/store/HeroSection";
import MenuSection from "@/components/store/MenuSection";
import EventBanner from "@/components/store/EventBanner";
import CartDrawer from "@/components/store/CartDrawer";
import Footer from "@/components/store/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <MenuSection />
        <EventBanner />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default Index;
