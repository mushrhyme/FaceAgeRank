import { Loader2 } from "lucide-react";
import Footer from "@/components/Footer";
import EventHeader from "@/components/EventHeader";
import ParticlesBackground from "@/components/ParticlesBackground";

export default function LoadingAnalysis() {
  return (
    <div className="h-screen flex flex-col bg-background relative overflow-hidden">
      {/* 배경 파티클 레이어 - z-index로 콘텐츠 뒤에 배치 */}
      <ParticlesBackground />
      <div className="relative z-10">
        <EventHeader />
      </div>
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="text-center space-y-12">
        <div className="relative">
          <div className="w-40 h-40 mx-auto">
            <Loader2
              className="w-full h-full text-primary animate-spin"
              strokeWidth={2}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 animate-pulse" />
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-semibold" data-testid="text-loading">
            분석 중...
          </h2>
          <p className="text-2xl text-muted-foreground">
            AI가 얼굴 나이를 분석하고 있습니다
          </p>
        </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}