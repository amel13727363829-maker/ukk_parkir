export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600 animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-4 border-transparent border-b-indigo-600 animate-spin" style={{ animationDirection: 'reverse' }}></div>
      </div>
      <span className="ml-4 text-gray-600 font-medium">Memuat...</span>
    </div>
  );
}
