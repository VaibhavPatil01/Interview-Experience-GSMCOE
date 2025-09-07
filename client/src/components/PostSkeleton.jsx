function PostSkeleton() {
  return (
    <div className="mb-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="w-[9%] h-6 rounded bg-gray-300 animate-pulse"></div>
        <h3 className="w-[23%] h-5 mt-4 rounded bg-gray-300 animate-pulse"></h3>
        <p className="w-full h-4 mt-1.5 rounded bg-gray-300 animate-pulse"></p>
        <p className="w-full h-4 mt-1.5 rounded bg-gray-300 animate-pulse"></p>

        <div className="flex items-center gap-4 mt-5 mb-2">
          <div className="w-[12%] h-5 rounded bg-gray-300 animate-pulse"></div>
          <div className="w-[12%] h-5 rounded bg-gray-300 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

export default PostSkeleton;
