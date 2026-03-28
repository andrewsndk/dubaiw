import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import aboutHero from "@/assets/about-hero.jpg";
import aboutMechanism from "@/assets/about-mechanism.jpg";
import aboutStore from "@/assets/about.png";
import aboutCraftsman from "@/assets/about-craftsman.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.7 },
};

const About = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero with background image */}
        <section className="relative overflow-hidden min-h-[70vh] md:min-h-[80vh] flex items-end">
          <img
            src={aboutHero}
            alt="Luxury watch on wrist"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          <div className="container px-4 md:px-8 py-16 md:py-24 relative z-10 text-white">
            <motion.p
              className="text-xs tracking-ultra-wide text-white/60 mb-4"
              {...fadeUp}
            >
              DUBAI, UAE
            </motion.p>
            <motion.h2
              className="text-4xl sm:text-5xl md:text-7xl font-display font-bold leading-[0.95] max-w-3xl"
              {...fadeUp}
              transition={{ duration: 0.8, delay: 0.15 }}
            >
              The Art of<br />Curated Time
            </motion.h2>
            <motion.p
              className="text-lg md:text-xl text-white/70 mt-8 max-w-xl leading-relaxed"
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              Andii Luxury Watch was founded on a singular obsession — to bring the world's
              most exceptional timepieces together, offering uncompromising
              authenticity and personalized service.
            </motion.p>
          </div>
        </section>

        {/* Story with store image */}
        <section className="container px-4 md:px-8 py-20 md:py-28 space-y-16">
          <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center">
            <p className="text-xs tracking-ultra-wide text-muted-foreground mb-4">OUR STORY</p>
            <h3 className="text-3xl md:text-5xl font-display font-bold text-foreground leading-tight mb-8">
              From Passion<br />to Destination
            </h3>
            <div className="space-y-6 text-muted-foreground leading-relaxed text-lg">
              <p>
                Founded in the heart of Dubai, Andii Luxury Watch began as an exclusive
                private collection. What started as a dedicated passion for the art of
                fine watchmaking quickly evolved into one of the region's most
                distinguished destinations for luxury timepieces.
              </p>
              <p>
                Our founder, driven by decades of fascination with horology, envisioned
                a space where collectors — whether acquiring their first piece or their
                fiftieth — could experience the same level of expertise, transparency,
                and care.
              </p>
            </div>
          </motion.div>
          <motion.div
            className="relative overflow-hidden w-full max-w-3xl mx-auto flex justify-start rounded-2xl shadow-xl"
            {...fadeUp}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <img
              src={aboutStore}
              alt="Andii Luxury Watch boutique interior"
              className="w-[117.6%] h-auto max-w-none object-left"
            />
          </motion.div>
        </section>

        {/* Mechanism + Craftsman image gallery */}
        <section className="bg-foreground text-background">
          <div className="container px-4 md:px-8 py-20 md:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <motion.div
                className="grid grid-cols-2 gap-4"
                {...fadeUp}
              >
                <img
                  src={aboutMechanism}
                  alt="Watch mechanism close-up"
                  className="w-full aspect-square object-cover"
                />
                <img
                  src={aboutCraftsman}
                  alt="Watchmaker inspecting timepiece"
                  className="w-full aspect-square object-cover mt-8"
                />
              </motion.div>
              <motion.div
                {...fadeUp}
                transition={{ duration: 0.7, delay: 0.15 }}
              >
                <p className="text-xs tracking-ultra-wide text-background/60 mb-4">CRAFTSMANSHIP</p>
                <h3 className="text-3xl md:text-4xl font-display font-bold leading-tight mb-6">
                  Every Detail<br />Matters
                </h3>
                <div className="space-y-6 text-background/70 leading-relaxed">
                  <p>
                    Every watch that enters our collection is meticulously
                    inspected, authenticated, and documented by certified horologists
                    with decades of combined expertise.
                  </p>
                  <p>
                    Today, Andii Luxury Watch curates over 500 exceptional timepieces from the
                    world's most prestigious manufactures — Rolex, Audemars Piguet, Patek
                    Philippe, Richard Mille, and many more. We serve clients across the
                    GCC, Europe, and beyond.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-secondary/30 border-y border-border">
          <div className="container px-4 md:px-8 py-20 md:py-28">
            <motion.p className="text-xs tracking-ultra-wide text-muted-foreground mb-4 text-center" {...fadeUp}>
              WHAT WE STAND FOR
            </motion.p>
            <motion.h3
              className="text-3xl md:text-4xl font-display font-bold text-foreground text-center mb-16"
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              Our Principles
            </motion.h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
              {[
                {
                  title: "AUTHENTICITY FIRST",
                  text: "Every timepiece undergoes rigorous multi-point authentication by certified horologists. We guarantee the provenance and condition of every piece we sell.",
                },
                {
                  title: "TRANSPARENT PRICING",
                  text: "Our prices reflect real market values. No inflated markups, no hidden fees. We believe trust is built through honesty — and our repeat clients are proof.",
                },
                {
                  title: "LIFETIME RELATIONSHIP",
                  text: "We don't just sell watches — we build collections. Our advisory team helps clients make informed decisions, whether buying, selling, or trading.",
                },
              ].map((v, i) => (
                <motion.div
                  key={v.title}
                  className="text-center lg:text-left"
                  {...fadeUp}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <div className="w-12 h-12 mx-auto lg:mx-0 border border-border flex items-center justify-center mb-4">
                    <span className="text-lg font-display font-bold text-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold tracking-wide text-foreground mb-3">
                    {v.title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Numbers */}
        <section className="container px-4 md:px-8 py-20 md:py-28">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "500+", label: "Watches in Collection" },
              { number: "50+", label: "Luxury Brands" },
              { number: "100%", label: "Authenticity Guaranteed" },
              { number: "30+", label: "Countries Served" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="text-center"
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <p className="text-4xl md:text-5xl font-display font-bold text-foreground">
                  {stat.number}
                </p>
                <p className="text-xs text-muted-foreground mt-2 tracking-wide">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-foreground text-background">
          <div className="container px-4 md:px-8 py-20 md:py-28 text-center">
            <motion.h3
              className="text-3xl md:text-5xl font-display font-bold mb-6"
              {...fadeUp}
            >
              Start Your Collection
            </motion.h3>
            <motion.p
              className="text-background/70 max-w-lg mx-auto mb-10 leading-relaxed"
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              Whether you're looking for a grail piece or exploring the world of
              fine watchmaking for the first time, our team is here to guide you.
            </motion.p>
            <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }}>
              <Link
                to="/catalog"
                className="inline-block bg-background text-foreground px-10 py-4 text-sm font-medium tracking-wide hover:opacity-90 transition-opacity"
              >
                EXPLORE COLLECTION
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
