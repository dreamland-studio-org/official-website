export default function Loading() {
  return (
    <section className="mt-40 mb-40 flex mx-70 animate-pulse">
      <div className="grid grid-cols-6 gap-x-5 w-full">
        {/* 左側內容 */}
        <div className="col-span-4 space-y-4">
          <div className="h-10 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-[400px] bg-gray-200 rounded-4xl mt-10"></div>
        </div>

        {/* 右側資訊欄 */}
        <div className="col-span-2 space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-6 bg-gray-300 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
