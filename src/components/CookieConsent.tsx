import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "~/components/ui/button";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "kongofix_cookie_consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    // Small delay so the animation plays after mount
    const timer = setTimeout(() => {
      const consented = localStorage.getItem(STORAGE_KEY);
      if (consented !== "true") {
        setVisible(true);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  function handleAccept() {
    localStorage.setItem(STORAGE_KEY, "true");
    setDismissing(true);
    setTimeout(() => setVisible(false), 300);
  }

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
        dismissing
          ? "translate-y-full opacity-0"
          : "translate-y-0 opacity-100 animate-slide-up"
      }`}
    >
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Icon + Message */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-1.5 rounded-lg bg-amber-50 shrink-0 mt-0.5">
              <Cookie className="h-4 w-4 text-amber-600" />
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Nous utilisons des cookies pour améliorer votre expérience. En continuant, vous
              acceptez notre{" "}
              <Link
                to="/confidentialite"
                className="underline underline-offset-2 hover:text-foreground transition-colors font-medium"
              >
                politique de confidentialité
              </Link>
              .
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <Button
              variant="outline"
              size="sm"
              asChild
              className="text-xs h-8"
            >
              <Link to="/confidentialite">
                Politique de confidentialité
              </Link>
            </Button>
            <Button
              size="sm"
              onClick={handleAccept}
              className="text-xs h-8"
            >
              Accepter
            </Button>
            <button
              onClick={handleAccept}
              className="p-1 rounded-md hover:bg-muted transition-colors sm:hidden"
              aria-label="Fermer"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
