import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";

const footerColumns = [
  {
    label: "Platform",
    links: [
      { label: "Courses", to: "/courses" },
      { label: "Dashboard", to: "/dashboard" },
      { label: "Certificates", to: "/certificates" },
    ],
  },
  {
    label: "Resources",
    links: [
      { label: "Documentation", to: "#" },
      { label: "API Reference", to: "#" },
      { label: "Support", to: "#" },
    ],
  },
  {
    label: "Institution",
    links: [
      { label: "About", to: "#" },
      { label: "Contact", to: "#" },
      { label: "Privacy Policy", to: "#" },
    ],
  },
];

const legalLinks = [
  { label: "Privacy Policy", to: "#" },
  { label: "Terms of Service", to: "#" },
  { label: "Accessibility Statement", to: "#" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer role="contentinfo" className="border-t border-border bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 font-heading text-lg font-bold mb-4">
              <BookOpen className="h-5 w-5 text-primary" />
              <span>LearnHub</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              A learning management system for high schools and universities.
              Manage courses, students, and content — all in one place.
            </p>
          </div>
          {footerColumns.map((col) => (
            <nav key={col.label} aria-label={col.label}>
              <h3 className="text-sm font-semibold mb-3 font-heading">{col.label}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-2">
            {legalLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-150"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p className="text-xs text-muted-foreground">&copy; {year} LearnHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
