import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import Footer from "@/components/Footer";
import EventHeader from "@/components/EventHeader";
import ParticlesBackground from "@/components/ParticlesBackground";
import MatrixBackground from "@/components/MatrixBackground";
import { soundManager, SOUNDS } from "@/lib/sound";

interface LoadingAnalysisProps {
  capturedImage?: string; // Home.tsx에서 전달하지만 현재 사용하지 않음
}

export default function LoadingAnalysis({ capturedImage }: LoadingAnalysisProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null); // 배경음악 제어를 위한 ref

  // 컴포넌트가 마운트될 때 배경음악 재생
  useEffect(() => {
    // 분석 중 배경음악 재생 (반복 재생)
    const audio = soundManager.playBackground(SOUNDS.DIGITAL, 0.5);
    audioRef.current = audio;

    // 컴포넌트가 언마운트될 때 음악 정지
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-black relative overflow-hidden">
      {/* 배경 파티클 레이어 - z-index로 콘텐츠 뒤에 배치 */}
      <MatrixBackground color="#26bfa6" opacity={0.2} density={0.4} />
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
          <h2 className="text-4xl font-semibold text-white" data-testid="text-loading">
            분석 중...
          </h2>
          <p className="text-2xl text-gray-300">
            AI가 얼굴 나이를 분석하고 있습니다
          </p>
        </div>
        </div>
      </div>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}