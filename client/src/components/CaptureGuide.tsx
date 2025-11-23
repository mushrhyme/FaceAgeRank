import { Button } from "@/components/ui/button";
import { Camera, CheckCircle2 } from "lucide-react";
import Footer from "@/components/Footer";
import EventHeader from "@/components/EventHeader";
import MatrixBackground from "@/components/MatrixBackground";
import { useIsMobile } from "@/hooks/use-mobile";

interface CaptureGuideProps {
  onStart: () => void;
}

export default function CaptureGuide({ onStart }: CaptureGuideProps) {
  const isMobile = useIsMobile(); // 모바일 레이아웃 감지
  return (
    <div className="h-screen flex flex-col bg-black relative overflow-hidden">
      <MatrixBackground color="#26bfa6" opacity={0.5} />
      <div className="relative z-10">
        <EventHeader />
      </div>
      <div className={`flex-1 flex items-center justify-center ${isMobile ? 'p-4 pt-20' : 'p-8'} relative z-10`}>
      <div className={`w-full ${isMobile ? 'max-w-md' : 'max-w-6xl'}`}>
        {/* 헤더 */}
        <div className={`text-center ${isMobile ? 'pb-4 mb-4' : 'pb-8 mb-8'}`}>
          <div className={`mx-auto ${isMobile ? 'w-16 h-16' : 'w-24 h-24'} rounded-full bg-primary/10 flex items-center justify-center ${isMobile ? 'mb-4' : 'mb-6'}`}>
            <Camera className={`${isMobile ? "w-10 h-10" : "w-16 h-16"} text-primary`} />
          </div>
          <h1 className={`${isMobile ? 'text-2xl' : 'text-5xl'} font-semibold ${isMobile ? 'mb-2' : 'mb-4'} text-white`}>촬영 안내</h1>
          <p className={`${isMobile ? 'text-base' : 'text-3xl'} text-gray-300`}>
            아래 안내에 따라 촬영을 진행해주세요
          </p>
        </div>

        {/* 안내 사항 - 카드 */}
        <div className={`${isMobile ? 'max-w-sm' : 'max-w-6xl'} mx-auto ${isMobile ? 'mb-6' : 'mb-12'} bg-gray-900/90 border border-gray-700 rounded-xl shadow ${isMobile ? 'p-4' : 'p-8'}`}>
          <div className={isMobile ? "space-y-3" : "space-y-6"}>
            <div className="flex items-start gap-3">
              <CheckCircle2 className={`${isMobile ? 'w-5 h-5' : 'w-8 h-8'} text-primary flex-shrink-0 mt-1`} />
              <p className={`${isMobile ? 'text-sm' : 'text-3xl'} text-gray-300 text-left`}>
                얼굴이 화면 중앙의 가이드라인 안에 오도록 위치해주세요
              </p>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className={`${isMobile ? 'w-5 h-5' : 'w-8 h-8'} text-primary flex-shrink-0 mt-1`} />
              <p className={`${isMobile ? 'text-sm' : 'text-3xl'} text-gray-300 text-left`}>
                카메라를 정면으로 바라봐주세요
              </p>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className={`${isMobile ? 'w-5 h-5' : 'w-8 h-8'} text-primary flex-shrink-0 mt-1`} />
              <p className={`${isMobile ? 'text-sm' : 'text-3xl'} text-gray-300 text-left`}>
                촬영 시작 버튼을 누르면 3초 후 자동으로 촬영됩니다
              </p>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex justify-center">
          <Button
            onClick={onStart}
            className={`${isMobile ? 'h-12 px-8 text-base w-full' : 'h-20 px-16 text-2xl'} font-medium ${isMobile ? '' : 'min-w-80'}`}
            data-testid="button-start-capture"
          >
            촬영 시작
          </Button>
        </div>
      </div>
      </div>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
