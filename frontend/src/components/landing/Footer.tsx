import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { FAQ_ITEMS } from "../../lib/constants";
import VerdChainLogo from "./VerdChainLogo";

function FAQItem({
  item,
  index,
}: {
  item: { question: string; answer: string };
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const ref      = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      style={{
        borderBottom: "1px solid #E8E0D5",
        overflow:     "hidden",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width:          "100%",
          display:        "flex",
          alignItems:     "flex-start",
          justifyContent: "space-between",
          gap:            16,
          padding:        "24px 0",
          background:     "none",
          border:         "none",
          cursor:         "pointer",
          textAlign:      "left",
        }}
      >
        <span style={{
          fontSize:      15,
          fontWeight:    600,
          color:         "#1C1C1A",
          lineHeight:    1.5,
          flex:          1,
        }}>
          {item.question}
        </span>
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          style={{
            width:          28,
            height:         28,
            borderRadius:   "50%",
            background:     open ? "#2D6A4F" : "#F0EDE6",
            border:         `1.5px solid ${open ? "#2D6A4F" : "#E8E0D5"}`,
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            flexShrink:     0,
            marginTop:      2,
            transition:     "background 0.25s, border-color 0.25s",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M6 2V10M2 6H10"
              stroke={open ? "#FAF8F5" : "#6B6B63"}
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </motion.div>
      </button>

      <motion.div
        initial={false}
        animate={{
          height:  open ? "auto" : 0,
          opacity: open ? 1 : 0,
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        style={{ overflow: "hidden" }}
      >
        <p style={{
          fontSize:   14,
          lineHeight: 1.8,
          color:      "#6B6B63",
          paddingBottom: 24,
          maxWidth:   600,
        }}>
          {item.answer}
        </p>
      </motion.div>
    </motion.div>
  );
}

function ContactForm() {
  const [form, setForm]       = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    width:        "100%",
    padding:      "12px 16px",
    fontSize:     14,
    color:        "#1C1C1A",
    background:   "#FFFFFF",
    border:       `1.5px solid ${focused === field ? "#2D6A4F" : "#E8E0D5"}`,
    borderRadius: 10,
    outline:      "none",
    transition:   "border-color 0.2s",
    fontFamily:   "'Inter', system-ui, sans-serif",
    resize:       "none" as const,
  });

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background:     "#D8F3DC",
          border:         "1px solid rgba(45,106,79,0.2)",
          borderRadius:   16,
          padding:        48,
          textAlign:      "center",
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          gap:            16,
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
          style={{
            width:          56,
            height:         56,
            borderRadius:   "50%",
            background:     "#2D6A4F",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M5 13L9 17L19 7" stroke="#FAF8F5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#1A3D2B" }}>Message received</div>
        <div style={{ fontSize: 14, color: "#2D6A4F", maxWidth: 280, lineHeight: 1.6 }}>
          We will get back to you shortly. In the meantime, explore the live dashboard.
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#6B6B63", display: "block", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Name
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            onFocus={() => setFocused("name")}
            onBlur={()  => setFocused(null)}
            placeholder="Your name"
            required
            style={inputStyle("name")}
          />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#6B6B63", display: "block", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Email
          </label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            onFocus={() => setFocused("email")}
            onBlur={()  => setFocused(null)}
            placeholder="you@company.com"
            required
            style={inputStyle("email")}
          />
        </div>
      </div>

      <div>
        <label style={{ fontSize: 11, fontWeight: 600, color: "#6B6B63", display: "block", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase" }}>
          Message
        </label>
        <textarea
          value={form.message}
          onChange={e => setForm({ ...form, message: e.target.value })}
          onFocus={() => setFocused("message")}
          onBlur={()  => setFocused(null)}
          placeholder="Tell us about your MRV needs, research interest, or partnership opportunity..."
          required
          rows={5}
          style={inputStyle("message")}
        />
      </div>

      <motion.button
        type="submit"
        whileHover={{ scale: 1.02, y: -2, boxShadow: "0 12px 32px rgba(45,106,79,0.25)" }}
        whileTap={{ scale: 0.98 }}
        style={{
          background:   "#2D6A4F",
          color:        "#FAF8F5",
          border:       "none",
          borderRadius: 10,
          padding:      "13px 28px",
          fontSize:     14,
          fontWeight:   700,
          cursor:       "pointer",
          alignSelf:    "flex-start",
          fontFamily:   "'Inter', system-ui, sans-serif",
          boxShadow:    "0 4px 16px rgba(45,106,79,0.2)",
        }}
      >
        Send Message
      </motion.button>
    </form>
  );
}

function SocialLink({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ x: 4 }}
      style={{
        display:        "flex",
        alignItems:     "center",
        gap:            10,
        color:          "#6B6B63",
        textDecoration: "none",
        fontSize:       14,
        fontWeight:     500,
        padding:        "8px 0",
        transition:     "color 0.2s",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#2D6A4F"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#6B6B63"; }}
    >
      <div style={{
        width:          32,
        height:         32,
        borderRadius:   8,
        background:     "#F0EDE6",
        border:         "1px solid #E8E0D5",
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        flexShrink:     0,
      }}>
        {icon}
      </div>
      {label}
    </motion.a>
  );
}

export default function Footer() {
  const faqRef      = useRef<HTMLDivElement>(null);
  const faqInView   = useInView(faqRef, { once: true, margin: "-80px" });
  const footerRef   = useRef<HTMLDivElement>(null);
  const footerInView = useInView(footerRef, { once: true, margin: "-60px" });

  return (
    <>
      {/* FAQ Section */}
      <section
        id="faq"
        style={{
          background: "#FAF8F5",
          padding:    "100px 48px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 80, alignItems: "start" }}>

            {/* Left — sticky label */}
            <motion.div
              ref={faqRef}
              initial={{ opacity: 0, x: -20 }}
              animate={faqInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
              style={{ position: "sticky", top: 100 }}
            >
              <div style={{
                fontSize:      11,
                fontWeight:    700,
                fontFamily:    "'JetBrains Mono', monospace",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color:         "#52B788",
                marginBottom:  16,
              }}>
                Common Questions
              </div>
              <h2 style={{
                fontSize:      42,
                fontWeight:    900,
                color:         "#1C1C1A",
                letterSpacing: "-0.03em",
                lineHeight:    1.15,
                marginBottom:  20,
              }}>
                Technical<br />FAQ
              </h2>
              <p style={{
                fontSize:   14,
                lineHeight: 1.75,
                color:      "#6B6B63",
                marginBottom: 32,
              }}>
                Answers to the questions institutional buyers, auditors, and engineers ask most often.
              </p>

              <div style={{
                background:   "rgba(45,106,79,0.06)",
                border:       "1px solid rgba(45,106,79,0.15)",
                borderRadius: 12,
                padding:      "16px 20px",
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#2D6A4F", marginBottom: 8 }}>
                  Still have questions?
                </div>
                <div style={{ fontSize: 13, color: "#6B6B63", lineHeight: 1.6 }}>
                  Use the contact form below or open an issue on GitHub.
                </div>
              </div>
            </motion.div>

            {/* Right — accordion */}
            <div>
              {FAQ_ITEMS.map((item, index) => (
                <FAQItem key={index} item={item} index={index} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        style={{
          background:  "#F2EDE6",
          padding:     "100px 48px",
          borderTop:   "1px solid #E8E0D5",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>

            {/* Left — copy */}
            <motion.div
              ref={footerRef}
              initial={{ opacity: 0, y: 30 }}
              animate={footerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
            >
              <div style={{
                fontSize:      11,
                fontWeight:    700,
                fontFamily:    "'JetBrains Mono', monospace",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color:         "#52B788",
                marginBottom:  16,
              }}>
                Get In Touch
              </div>

              <h2 style={{
                fontSize:      48,
                fontWeight:    900,
                color:         "#1C1C1A",
                letterSpacing: "-0.03em",
                lineHeight:    1.1,
                marginBottom:  20,
              }}>
                Let's verify<br />
                <span style={{ color: "#2D6A4F" }}>the planet.</span>
              </h2>

              <p style={{
                fontSize:     16,
                lineHeight:   1.8,
                color:        "#6B6B63",
                marginBottom: 40,
                maxWidth:     400,
              }}>
                Whether you are a corporate ESG buyer, a coastal ecology researcher,
                a government environment agency, or an engineer interested in the stack —
                we want to hear from you.
              </p>

              {/* Social links */}
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <SocialLink
                  href="https://github.com/Excalibur677/verdchain"
                  label="Excalibur677 / verdchain"
                  icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="#3D3D38">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                  }
                />
                <SocialLink
                  href="https://biothon.xinity.in"
                  label="Biothon 2026 — Xinity Tech"
                  icon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3D3D38" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                    </svg>
                  }
                />
                
                  
                
              </div>
            </motion.div>

            {/* Right — contact form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={footerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.2 }}
              style={{
                background:   "#FFFFFF",
                borderRadius: 20,
                border:       "1px solid #E8E0D5",
                padding:      "36px",
                boxShadow:    "0 4px 24px rgba(28,28,26,0.06)",
              }}
            >
              <div style={{ marginBottom: 24 }}>
                <h3 style={{
                  fontSize:      20,
                  fontWeight:    700,
                  color:         "#1C1C1A",
                  letterSpacing: "-0.01em",
                  marginBottom:  6,
                }}>
                  Send an inquiry
                </h3>
                <p style={{ fontSize: 13, color: "#9E9E8E", lineHeight: 1.5 }}>
                  For partnerships, research access, ESG buyer inquiries, or technical collaboration.
                </p>
              </div>
              <ContactForm />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bottom footer bar */}
      <footer style={{
        background:    "#1A3D2B",
        padding:       "32px 48px",
        borderTop:     "1px solid rgba(255,255,255,0.06)",
      }}>
        <div style={{
          maxWidth:      1200,
          margin:        "0 auto",
          display:       "flex",
          alignItems:    "center",
          justifyContent:"space-between",
          flexWrap:      "wrap",
          gap:           20,
        }}>
          <VerdChainLogo size={32} animate={false} />

          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {[
              { label: "GitHub",     href: "https://github.com/Excalibur677/verdchain" },
              { label: "Biothon",    href: "https://biothon.xinity.in" },
              { label: "Dashboard",  href: "/dashboard" },
            ].map(link => (
              <a
                key={link.label}
                href={link.href}
                style={{
                  fontSize:       13,
                  color:          "rgba(255,255,255,0.5)",
                  textDecoration: "none",
                  fontWeight:     500,
                  transition:     "color 0.2s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = "#95D5B2"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.5)"; }}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{
              fontSize:      11,
              fontFamily:    "'JetBrains Mono', monospace",
              color:         "rgba(255,255,255,0.3)",
              letterSpacing: "0.06em",
            }}>
              BIOTHON 2026 — TEAM EXCALIBUR
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ width: 6, height: 6, borderRadius: "50%", background: "#52B788" }}
              />
              <span style={{
                fontSize:      11,
                fontFamily:    "'JetBrains Mono', monospace",
                color:         "#52B788",
                letterSpacing: "0.06em",
              }}>
                SYSTEM LIVE
              </span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}