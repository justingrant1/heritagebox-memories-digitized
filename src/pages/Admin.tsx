
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import AdminSection from "@/components/AdminSection";
import SEOHelmet from "@/components/SEOHelmet";

const AdminPage = () => {
  return (
    <div className="min-h-screen">
      <SEOHelmet 
        title="HeritageBox Admin | Form Submissions"
        description="Admin panel for HeritageBox website"
        noIndex={true}
      />
      <NavBar />
      <main>
        <AdminSection />
      </main>
      <Footer />
    </div>
  );
};

export default AdminPage;
