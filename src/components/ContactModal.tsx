import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";

interface ContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TELEGRAM_LINK = "https://t.me/your_manager";
const WHATSAPP_LINK = "https://wa.me/97100000000";

const ContactModal = ({ open, onOpenChange }: ContactModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm p-0 overflow-hidden bg-white border border-border shadow-2xl rounded-none">

        {/* Top navy accent bar */}
        <div className="h-1 w-full bg-primary" />

        <div className="px-8 pt-7 pb-8">
          <DialogHeader className="mb-6">
            <div className="flex flex-col items-center text-center gap-2">
              {/* Icon */}
              <div className="w-12 h-12 border border-border flex items-center justify-center mb-2">
                <svg
                  className="w-5 h-5 text-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>

              <DialogTitle className="text-sm font-display font-semibold tracking-ultra-wide text-foreground uppercase">
                Contact a Manager
              </DialogTitle>
              <p className="text-xs tracking-wide text-muted-foreground">
                Choose a convenient way to reach us
              </p>
            </div>
          </DialogHeader>

          {/* Divider */}
          <div className="h-px bg-border mb-6" />

          <div className="flex flex-col gap-3">
            {/* Telegram button */}
            <motion.a
              href={TELEGRAM_LINK}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-4 px-4 py-3 border border-border hover:border-foreground/40 transition-all duration-200 group"
              style={{ textDecoration: "none" }}
            >
              {/* Telegram icon */}
              <div
                className="w-10 h-10 flex items-center justify-center shrink-0"
                style={{ background: "#229ED9" }}
              >
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </div>

              <div className="flex flex-col flex-1">
                <span className="font-medium text-sm tracking-wide text-foreground">Telegram</span>
                <span className="text-xs text-muted-foreground">Quick reply in messenger</span>
              </div>

              <svg
                className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </motion.a>

            {/* WhatsApp button */}
            <motion.a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-4 px-4 py-3 border border-border hover:border-foreground/40 transition-all duration-200 group"
              style={{ textDecoration: "none" }}
            >
              {/* WhatsApp icon */}
              <div
                className="w-10 h-10 flex items-center justify-center shrink-0"
                style={{ background: "#25D366" }}
              >
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>

              <div className="flex flex-col flex-1">
                <span className="font-medium text-sm tracking-wide text-foreground">WhatsApp</span>
                <span className="text-xs text-muted-foreground">Message the manager directly</span>
              </div>

              <svg
                className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </motion.a>
          </div>

          {/* Footer note */}
          <p className="text-center text-xs mt-6 tracking-widest text-muted-foreground uppercase">
            Available 7 days a week · 9:00 – 22:00
          </p>
        </div>

        {/* Bottom border accent */}
        <div className="h-px w-full bg-border" />
      </DialogContent>
    </Dialog>
  );
};

export default ContactModal;
