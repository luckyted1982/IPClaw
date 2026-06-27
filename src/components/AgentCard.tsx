import { motion } from "framer-motion";
import { Star, CheckCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentCardProps {
  id: string;
  name: string;
  avatar: string;
  owner: string;
  title?: string;
  verified?: boolean;
  badges: string[];
  stats: {
    rating: number;
    tasks: number;
    earnings: number;
    trustScore: number;
  };
  recentActivity: string;
  index?: number;
  onViewDetail?: (id: string) => void;
}

export default function AgentCard({
  id,
  name,
  avatar,
  owner,
  title = "",
  verified = false,
  badges,
  stats,
  recentActivity,
  index = 0,
  onViewDetail,
}: AgentCardProps) {
  const formatEarnings = (n: number) => {
    if (n >= 10000) return `¥${(n / 10000).toFixed(0)}万`;
    return `¥${n.toLocaleString()}`;
  };

  const formatTasks = (n: number) => {
    return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n.toString();
  };

  const trustGrade = stats.trustScore >= 95 ? "S" : stats.trustScore >= 90 ? "A" : stats.trustScore >= 80 ? "B" : "C";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.08,
        duration: 0.4,
        ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
      }}
      whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
      className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--navy-700)] p-6 transition-all duration-250"
      style={{
        background: "var(--gradient-navy-card)",
        cursor: "pointer",
      }}
      onClick={() => onViewDetail?.(id)}
    >
      {/* Gold shimmer on hover */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(250,204,21,0.03), transparent)",
          animation: "shimmer 1.5s ease-in-out infinite",
        }}
      />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold"
            style={{
              background: "linear-gradient(135deg, #FACC15, #EAB308)",
              color: "var(--navy-900)",
            }}
          >
            {avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[var(--text-primary)]">
                {name}
              </span>
              {verified && (
                <CheckCircle
                  size={14}
                  className="text-[var(--info)]"
                  aria-label="已认证"
                />
              )}
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              所有者: {owner}
              {title && ` · ${title}`}
            </div>
          </div>
        </div>
        <div
          className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
          style={{
            background: "rgba(250, 204, 21, 0.12)",
            color: "var(--gold-400)",
          }}
        >
          <span>信任等级 {trustGrade}</span>
          <span className="opacity-60">({stats.trustScore})</span>
        </div>
      </div>

      {/* Badges */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {badges.map((badge) => (
          <span
            key={badge}
            className="rounded-full px-2.5 py-0.5 text-xs font-medium"
            style={{
              background: "rgba(250, 204, 21, 0.1)",
              border: "1px solid rgba(250, 204, 21, 0.2)",
              color: "var(--gold-400)",
            }}
          >
            {badge}
          </span>
        ))}
      </div>

      {/* Stats Grid */}
      <div
        className="mt-4 grid grid-cols-4 gap-3 border-t border-b border-[var(--navy-700)] py-3"
      >
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-0.5">
            <Star size={12} className="text-[var(--gold-400)]" fill="var(--gold-400)" />
            <span className="text-sm font-bold text-[var(--gold-400)]" style={{ fontFamily: '"Inter", sans-serif' }}>
              {stats.rating}
            </span>
          </div>
          <span className="text-[11px] text-[var(--text-muted)]">评分</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold text-[var(--gold-400)]" style={{ fontFamily: '"Inter", sans-serif' }}>
            {formatTasks(stats.tasks)}
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">任务</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold text-[var(--gold-400)]" style={{ fontFamily: '"Inter", sans-serif' }}>
            {formatEarnings(stats.earnings)}
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">收益</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-bold text-[var(--gold-400)]" style={{ fontFamily: '"Inter", sans-serif' }}>
            {stats.trustScore}
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">信任分</span>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-3 text-xs text-[var(--text-secondary)] truncate">
        最近: {recentActivity}
      </div>

      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <button
          className="flex-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors"
          style={{
            background: "var(--gold-400)",
            color: "var(--navy-900)",
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          委托任务
        </button>
        <button
          className={cn(
            "flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors",
            "border-[var(--navy-700)] text-[var(--text-secondary)] hover:border-[var(--gold-400)] hover:text-[var(--text-primary)]"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onViewDetail?.(id);
          }}
        >
          <span className="flex items-center justify-center gap-1">
            查看详情 <ArrowRight size={14} />
          </span>
        </button>
      </div>
    </motion.div>
  );
}