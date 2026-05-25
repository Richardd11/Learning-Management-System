import { Link } from "@tanstack/react-router";
import { BookOpen, Github, Twitter, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const footerLinks = {
  Product: [
    { label: "Courses", to: "/courses" },
    { label: "Pricing", to: "/#pricing" },
    { label: "For Teams", to: "/#pricing" },
    { label: "Certificates", to: "/certificates" },
  ],
  Company: [
    { label: "About", to: "/" },
    { label: "Blog", to: "/" },
    { label: "Careers", to: "/" },
    { label: "Contact", to: "/" },
  ],
  Resources: [
    { label: "Documentation", to: "/" },
    { label: "Help Center", to: "/" },
    { label: "Community", to: "/" },
    { label: "API", to: "/" },
  ],
  Legal: [
    { label: "Privacy", to: "/" },
    { label: "Terms", to: "/" },
    { label: "Cookie Policy", to: "/" },
  ],
};

const socialLinks = [
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Mail, href: "#", label: "Email" },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold gradient-text">LearnHub</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs">
              AI-powered learning platform with interactive courses, personalized tutoring, and verifiable certificates.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="h-9 w-9 rounded-full border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
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
            &copy; {new Date().getFullYear()} LearnHub. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <Input
              type="email"
              placeholder="Subscribe to newsletter"
              className="w-56 h-9 text-sm"
            />
            <Button size="sm" className="h-9">
              Subscribe
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
}
