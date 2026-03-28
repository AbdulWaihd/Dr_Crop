export default function Header() {
  return (
    <header className="bg-primary text-white px-4 py-4 shadow-md">
      <div className="max-w-lg mx-auto flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-xl">
          🌿
        </div>
        <div>
          <h1 className="text-lg font-bold leading-tight">Dr. Crop</h1>
          <p className="text-xs text-white/80">AI Crop Disease Detection</p>
        </div>
      </div>
    </header>
  );
}
