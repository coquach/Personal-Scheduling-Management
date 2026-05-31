"use client";

import { motion } from "framer-motion";
import { BrandLogo } from "@/components/ui/brand-logo";
import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex flex-col items-center justify-center gap-6"
      >
        <div className="relative grid place-items-center">
          {/* Outer rotating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 -m-6 rounded-full border border-primary/20"
          />
          {/* Inner rotating ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 -m-8 rounded-full border border-primary/10 border-t-primary/50"
          />
          
          {/* Pulsing logo */}
          <motion.div
            animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <BrandLogo size="lg" hideText className="drop-shadow-md" />
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex flex-col items-center gap-3 mt-4"
        >
          <div className="flex items-center gap-2">
            <Spinner size="sm" className="text-primary" />
            <h3 className="text-lg font-medium tracking-tight text-foreground">
              Loading workspace...
            </h3>
          </div>
          <motion.p
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="text-sm text-muted-foreground"
          >
            Getting things ready for you
          </motion.p>
        </motion.div>
      </motion.div>
    </div>
  );
}
