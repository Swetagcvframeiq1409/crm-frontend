function Bone({ className = "" }) {
  return <div className={`bg-[#E3E5EA] rounded animate-pulse ${className}`} />;
}

export function TableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="bg-white border border-[#E3E5EA] rounded-lg overflow-hidden">
      {/* fake thead */}
      <div className="bg-[#F5F6F8] border-b border-[#E3E5EA] px-4 py-3 flex gap-6">
        {Array.from({ length: cols }).map((_, i) => (
          <Bone key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`px-4 py-3.5 flex gap-6 items-center ${i < rows - 1 ? "border-b border-[#E3E5EA]" : ""}`}
        >
          <div className="flex flex-col gap-1.5 flex-[2]">
            <Bone className="h-3.5 w-3/4" />
            <Bone className="h-2.5 w-1/2" />
          </div>
          {Array.from({ length: cols - 1 }).map((_, j) => (
            <Bone key={j} className="h-3 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white border border-[#E3E5EA] rounded-lg p-5 flex flex-col gap-3">
          <div className="flex justify-between">
            <div className="flex flex-col gap-1.5 flex-1">
              <Bone className="h-4 w-2/3" />
              <Bone className="h-3 w-1/3" />
            </div>
            <Bone className="h-3 w-16" />
          </div>
          <Bone className="h-px w-full" />
          <div className="flex flex-col gap-2">
            <Bone className="h-3 w-full" />
            <Bone className="h-3 w-3/4" />
          </div>
          <Bone className="h-px w-full" />
          <div className="flex flex-col gap-1.5">
            <Bone className="h-3 w-1/2" />
            <Bone className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
