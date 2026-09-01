"use client";

export function SkeletonRows({ rows = 4, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          style={{ display: "flex", gap: "1rem", padding: "0.75rem 0.5rem", borderBottom: "1px solid #f0ece6" }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              style={{
                flex: c === 0 ? 2 : 1,
                height: "14px",
                borderRadius: "6px",
                background: "linear-gradient(90deg,#efebe6 25%,#f7f4f0 50%,#efebe6 75%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.4s ease-in-out infinite",
              }}
            />
          ))}
        </div>
      ))}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
