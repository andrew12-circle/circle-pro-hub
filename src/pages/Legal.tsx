import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { sanitizeHtml } from "@/lib/sanitize";

type LegalSection = {
  id: string;
  slug: string;
  title: string;
  lastUpdated: string;
  version: string;
  content: string;
};

type LegalData = {
  terms: LegalSection;
  privacy: LegalSection;
  cookies: LegalSection;
  compliance: LegalSection;
  sellerAgreement: LegalSection;
  buyerProtection: LegalSection;
  prohibited: LegalSection;
  disputeResolution: LegalSection;
  refundPolicy: LegalSection;
};

const Legal = () => {
  const [legalData, setLegalData] = useState<LegalData | null>(null);
  const [sections, setSections] = useState<{ key: keyof LegalData; data: LegalSection }[]>([]);
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    fetch('/fixtures/legal.json')
      .then(res => res.json())
      .then(data => {
        setLegalData(data);
        const sectionsList = [
          { key: "terms" as const, data: data.terms as LegalSection },
          { key: "privacy" as const, data: data.privacy as LegalSection },
          { key: "cookies" as const, data: data.cookies as LegalSection },
          { key: "compliance" as const, data: data.compliance as LegalSection },
          { key: "sellerAgreement" as const, data: data.sellerAgreement as LegalSection },
          { key: "buyerProtection" as const, data: data.buyerProtection as LegalSection },
          { key: "prohibited" as const, data: data.prohibited as LegalSection },
          { key: "disputeResolution" as const, data: data.disputeResolution as LegalSection },
          { key: "refundPolicy" as const, data: data.refundPolicy as LegalSection },
        ];
        setSections(sectionsList);
        setActiveSection(sectionsList[0].data.slug);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (sections.length === 0) return;
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      
      for (const section of sections) {
        const element = document.getElementById(section.data.slug);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.data.slug);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollToSection = (slug: string) => {
    const element = document.getElementById(slug);
    if (element) {
      const offset = 100;
      const elementPosition = element.offsetTop - offset;
      window.scrollTo({ top: elementPosition, behavior: "smooth" });
    }
  };

  const renderMarkdown = (content: string) => {
    // Sanitize the entire content first to prevent XSS
    const safeContent = sanitizeHtml(content);
    
    return safeContent.split("\n").map((line, index) => {
      if (line.startsWith("## ")) {
        return <h3 key={index} className="text-xl font-semibold mt-6 mb-3">{line.replace("## ", "")}</h3>;
      } else if (line.startsWith("### ")) {
        return <h4 key={index} className="text-lg font-semibold mt-4 mb-2">{line.replace("### ", "")}</h4>;
      } else if (line.startsWith("**") && line.endsWith("**")) {
        return <p key={index} className="font-semibold mt-3 mb-1">{line.replace(/\*\*/g, "")}</p>;
      } else if (line.startsWith("- ")) {
        return <li key={index} className="ml-6 mb-1">{line.replace("- ", "")}</li>;
      } else if (line.trim() === "") {
        return <br key={index} />;
      } else {
        return <p key={index} className="mb-2 text-muted-foreground">{line}</p>;
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Legal Information</h1>
          <p className="text-muted-foreground">
            All policies and agreements governing the use of CircleMarketplace.io
          </p>
        </div>

        {!legalData ? (
          <div className="text-center py-12">Loading legal documents...</div>
        ) : (
          <div className="flex gap-8">
            {/* Sticky Sidebar Navigation */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24">
                <Card>
                  <CardContent className="p-4">
                    <h2 className="font-semibold mb-4">Quick Navigation</h2>
                    <ScrollArea className="h-[calc(100vh-200px)]">
                      <nav className="space-y-1">
                        {sections.map(({ data }) => (
                          <Button
                            key={data.slug}
                            variant="ghost"
                            className={`w-full justify-start text-sm ${
                              activeSection === data.slug 
                                ? "bg-muted font-medium" 
                                : "text-muted-foreground"
                            }`}
                            onClick={() => scrollToSection(data.slug)}
                          >
                            {data.title}
                          </Button>
                        ))}
                      </nav>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 space-y-12">
              {sections.map(({ data }) => (
                <section key={data.slug} id={data.slug}>
                  <Card>
                    <CardContent className="p-8">
                      <div className="mb-6">
                        <h2 className="text-3xl font-bold mb-2">{data.title}</h2>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>Version {data.version}</span>
                          <span>•</span>
                          <span>Last updated: {new Date(data.lastUpdated).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="prose prose-neutral dark:prose-invert max-w-none">
                        {renderMarkdown(data.content)}
                      </div>
                    </CardContent>
                  </Card>
                </section>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Legal;
