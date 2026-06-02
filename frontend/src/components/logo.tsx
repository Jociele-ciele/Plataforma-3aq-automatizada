import { motion } from "framer-motion";

export function Logo({ size = 36 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <motion.div
        initial={{ rotate: -10, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="rounded-xl shadow-lg shadow-primary/30 bg-gradient-to-br from-primary via-fuchsia-500 to-accent flex items-center justify-center text-white font-extrabold"
        style={{ width: size, height: size }}
      >
        <span style={{ fontSize: size * 0.45 }}>3</span>
      </motion.div>
      <div className="flex flex-col leading-tight">
        <span className="font-extrabold tracking-tight text-base">
          3aq <span className="gradient-text">Talent</span>
        </span>
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
          recrutamento ia
        </span>
      </div>
    </div>
  );
}
