import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Store, Handshake } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="w-full border-t bg-muted/30">
      {/* Business Partner CTA Section */}
      <section className="w-full py-12 bg-background">
        <div className="container px-4 mx-auto">
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold">Are You a Business Partner?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join our marketplace as a service provider or co-marketing partner. List your services and connect with real estate professionals.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" className="gap-2">
                <Store className="h-5 w-5" />
                List Your Services
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Handshake className="h-5 w-5" />
                Join as Co-Marketing Partner
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer Content */}
      <div className="container px-4 py-12 mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <button className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Cookie Preferences
                </button>
              </li>
              <li>
                <Link to="/compliance" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Compliance Info
                </Link>
              </li>
            </ul>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Marketplace</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/seller-agreement" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Seller Agreement
                </Link>
              </li>
              <li>
                <Link to="/buyer-protection" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Buyer Protection
                </Link>
              </li>
              <li>
                <Link to="/prohibited" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Prohibited Items
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/circle-ministry" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Circle Ministry
                </Link>
              </li>
              <li>
                <Link to="/affiliate" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Affiliate Program
                </Link>
              </li>
              <li>
                <Link to="/dispute-resolution" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Dispute Resolution
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Security */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Security</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">SSL Secured</span>
                <span className="text-sm font-semibold">PCI Compliant</span>
              </div>
              <p className="text-xs text-muted-foreground">256-bit encryption</p>
            </div>
          </div>
        </div>

        {/* Disclaimers */}
        <div className="space-y-4 text-xs text-muted-foreground border-t pt-8">
          <p>
            <strong>Marketplace Disclaimer:</strong> CircleMarketplace.io is a venue for buyers and sellers. We are not responsible for the content, quality, legality, or accuracy of any vendor listing, nor the ability of sellers to fulfill services or buyers to pay for them. All vendor logos and third-party information are displayed for informational and comparative purposes only, based on publicly available data. Pricing shown reflects standard published rates and estimated copay examples for illustrative purposes only and does not constitute offers, guarantees, or vendor commitments unless marked as Verified. Circle Network does not claim partnership or affiliation with any unverified vendors.
          </p>
          
          <p>
            <strong>Age Restriction:</strong> You must be 18 years or older to use this marketplace.
          </p>
          
          <p>
            <strong>Geographic Restrictions:</strong> Available only where permitted by law.
          </p>
          
          <p>
            <strong>Tax Disclaimer:</strong> Buyers and sellers are responsible for determining and paying applicable taxes.
          </p>
          
          <p>
            <strong>Indemnification Notice:</strong> Users agree to indemnify and hold CircleMarketplace.io harmless from any claims arising from their use of the platform.
          </p>
          
          <p>
            <strong>As-Is Disclaimer:</strong> This platform is provided "as is" without warranties of any kind, either express or implied.
          </p>
          
          <p>
            <strong>User-Generated Content:</strong> Users are solely responsible for content they post. We may remove content that violates our policies.
          </p>
        </div>

        {/* Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t pt-8 mt-8">
          <p className="text-xs text-muted-foreground">
            © 2025 CircleMarketplace.io. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Payments secured by industry-leading providers</span>
            <div className="flex gap-2">
              <span className="font-semibold">Secure</span>
              <span className="font-semibold">Verified</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
