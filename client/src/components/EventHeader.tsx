// DT FAIR 2025 이벤트 헤더 컴포넌트
export default function EventHeader() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="flex items-center gap-4">
        <img 
          src="/ns-seed.png" 
          alt="NS SEED" 
          className="h-16 object-contain"
        />
        <img 
          src="/dt-fair-2025.png" 
          alt="DT FAIR 2025" 
          className="h-20 object-contain"
        />
      </div>
    </header>
  );
}

