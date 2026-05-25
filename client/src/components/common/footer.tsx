import { Link } from "@tanstack/react-router";
import { GraduationCap, Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  Platform: [
    { label: "Subjects", to: "/courses" },
    { label: "Certificates", to: "/certificates" },
    { label: "Dashboard", to: "/dashboard" },
  ],
  School: [
    { label: "About", to: "/" },
    { label: "Contact", to: "/" },
    { label: "Administration", to: "/admin" },
  ],
  Resources: [
    { label: "Help Center", to: "/" },
    { label: "Documentation", to: "/" },
    { label: "Community", to: "/" },
  ],
  Legal: [
    { label: "Privacy Policy", to: "/" },
    { label: "Terms of Use", to: "/" },
    { label: "Acceptable Use", to: "/" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold gradient-text">SchoolLMS</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              A complete learning management system for schools. AI-powered tools for teachers, interactive content for students.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>admin@school.edu</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>123 Education Ave</span>
              </div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-semibold text-sm mb-3">{category}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SchoolLMS. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Powered by AI-driven education technology
          </p>
        </div>
      </div>
    </footer>
  );
}
