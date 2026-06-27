import { motion } from "framer-motion";
import { Link, Shield } from "lucide-react";

interface BlockchainBlockProps {
  index: number;
  hash: string;
  timestamp: string;
  isActive?: boolean;
  delay?: number;
}

export default function BlockchainBlock({
  index,
  hash,
  timestamp,
  isActive = false,
  delay = 0,
}: BlockchainBlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        delay: delay + index * 0.15,
        duration: 0.4,
        ease: "easeOut",
      }}
      className="relative flex flex-col items-center"
    >
      {/* Block */}
      <motion.div
        animate={
          isActive
            ? {
                boxShadow: [
                  "0 0 0px rgba(250,204,21,0)",
                  "0 0 20px rgba(250,204,21,0.3)",
                  "0 0 0px rgba(250,204,21,0)",
                ],
              }
            : {}
        }
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative w-24 rounded-lg border p-3"
        style={{
          background: isActive
            ? "linear-gradient(180deg, #1E293B 0%, #0F172A 100%)"
            : "linear-gradient(180deg, #1E293B 0%, #0F172A 100%)",
          borderColor: isActive ? "var(--gold-400)" : "var(--navy-700)",
        }}
      >
        {/* Block number */}
        <div className="flex items-center justify-between">
          <span
            className="text-[10px] font-bold"
            style={{ color: "var(--gold-400)" }}
          >
            #{index}
          </span>
          <Shield
            size={10}
            className={isActive ? "text-[var(--success)]" : "text-[var(--navy-600)]"}
          />
        </div>

        {/* Hash */}
        <div
          className="mt-2 text-[9px] font-mono truncate"
          style={{ color: "var(--text-muted)" }}
        >
          {hash}
        </div>

        {/* Timestamp */}
        <div
          className="mt-1 text-[8px]"
          style={{ color: "var(--navy-600)" }}
        >
          {timestamp}
        </div>

        {/* Pulsing dot for active */}
        {isActive && (
          <div
            className="absolute -right-1 -top-1 h-3 w-3 rounded-full"
            style={{ background: "var(--success)" }}
          >
            <div
              className="absolute inset-0 rounded-full animate-ping"
              style={{ background: "var(--success)", opacity: 0.6 }}
            />
          </div>
        )}
      </motion.div>

      {/* Connector line to next block */}
      <div
        className="my-1 h-4 w-0.5"
        style={{
          background: "linear-gradient(180deg, var(--gold-400), rgba(250,204,21,0.2))",
        }}
      >
        <div
          className="h-full w-full"
          style={{
            background: "linear-gradient(180deg, transparent, var(--gold-400), transparent)",
            animation: "flowParticles 2s linear infinite",
          }}
        />
      </div>

      {/* Link icon between blocks */}
      <Link
        size={10}
        className="my-0.5"
        style={{ color: isActive ? "var(--gold-400)" : "var(--navy-700)" }}
      />
    </motion.div>
  );
}

/* Inline keyframes - injected via style tag in parent or CSS */
export function BlockchainStyles() {
  return (
    <style>{`
      @keyframes flowParticles {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100%); }
      }
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
    `}</style>
  );
}
