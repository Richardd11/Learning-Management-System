import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { roles } from "../data/roles";

export function RoleTabs() {
  const [activeTab, setActiveTab] = useState(roles[0].id);
  const activeRole = roles.find((r) => r.id === activeTab)!;
  const prefersReducedMotion = useReducedMotion();

  return (
    <section aria-labelledby="roles-heading" className="py-24 px-4 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 id="roles-heading" className="text-3xl md:text-4xl font-bold mb-4 font-heading">
            Built for every role
          </h2>
          <p className="text-lg text-muted-foreground">
            Each user gets a dedicated portal designed for their needs.
          </p>
        </div>

        <div role="tablist" aria-label="Platform roles" className="flex justify-center gap-2 mb-8">
          {roles.map((role) => (
            <button
              key={role.id}
              role="tab"
              aria-selected={activeTab === role.id}
              aria-controls={`tabpanel-${role.id}`}
              id={`tab-${role.id}`}
              onClick={() => setActiveTab(role.id)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[44px] ${
                activeTab === role.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-background text-muted-foreground hover:text-foreground border border-border/50"
              }`}
            >
              {role.title}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            role="tabpanel"
            id={`tabpanel-${activeRole.id}`}
            aria-labelledby={`tab-${activeRole.id}`}
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
          >
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-3">
                    <activeRole.icon className="h-8 w-8 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold font-heading">{activeRole.title}</h3>
                    <p className="text-sm text-muted-foreground">{activeRole.description}</p>
                  </div>
                </div>
                <ul className="space-y-3">
                  {activeRole.bullets.map((bullet, i) => (
                    <motion.li
                      key={i}
                      initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3, delay: i * 0.04 }}
                      className="flex items-start gap-3 text-muted-foreground"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
                      <span>{bullet}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
