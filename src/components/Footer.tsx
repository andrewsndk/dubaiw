const Footer = () => {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="container px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl tracking-ultra-wide font-semibold mb-4">ANDII LUXURY WATCH</h3>
            <p className="text-sm opacity-70 leading-relaxed">
              Your trusted destination for luxury timepieces. Authenticity guaranteed.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium tracking-wide mb-4">CONTACT</h4>
            <p className="text-sm opacity-70">WhatsApp: +971 XX XXX XXXX</p>
            <p className="text-sm opacity-70">Telegram: @watchlab</p>
          </div>
          <div>
            <h4 className="text-sm font-medium tracking-wide mb-4">GUARANTEES</h4>
            <p className="text-sm opacity-70">Authenticity Guarantee</p>
            <p className="text-sm opacity-70">Fair Pricing</p>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-primary-foreground/20 text-center">
          <p className="text-xs opacity-50">© {new Date().getFullYear()} Andii Luxury Watch. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
