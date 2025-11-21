import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Home } from "lucide-react";
import Footer from "@/components/Footer";
import EventHeader from "@/components/EventHeader";
import MatrixBackground from "@/components/MatrixBackground";
import { useYoungerConfetti } from "@/hooks/useYoungerConfetti";
import { useOlderRipple } from "@/hooks/useOlderRipple";
import { getResultMessage, isYoungerLook } from "@/lib/resultUtils";
import { soundManager, SOUNDS } from "@/lib/sound";

interface ResultDisplayProps {
  realAge: number;
  faceAge: number;
  capturedImage?: string;
  name: string;
  onReset: () => void;
}

export default function ResultDisplay({
  realAge,
  faceAge,
  capturedImage,
  name,
  onReset,
}: ResultDisplayProps) {
  const ageDifference = faceAge - realAge; // 얼굴 나이 - 실제 나이
  const youngerLook = isYoungerLook(ageDifference); // 동안 여부
  const olderLook = ageDifference > 0; // 노안 여부
  const message = getResultMessage(ageDifference); // 결과 메시지

  // 팡파레 효과 hook (동안일 때)
  useYoungerConfetti(youngerLook);
  
  // 리플 효과 hook (노안일 때)
  useOlderRipple(olderLook);

  // 결과에 따른 음향 효과 재생
  useEffect(() => {
    if (youngerLook) {
      // 동안일 때 firework 효과음 재생
      soundManager.play(SOUNDS.FIREWORK, 0.7);
    } else if (ageDifference > 0) {
      // 노안일 때 fail 효과음 재생
      soundManager.play(SOUNDS.FAIL, 0.7);
    }
    // ageDifference === 0일 때는 음향 효과 없음
  }, [youngerLook, ageDifference]);

  return (
    <div 
      className={`h-screen flex flex-col bg-black relative overflow-hidden ${
        olderLook ? 'animate-screen-shake' : ''
      }`}
    >
      <MatrixBackground color="#26bfa6" opacity={0.2} density={0.4} />
      <div className="relative z-10">
        <EventHeader />
      </div>
      <div className="flex-1 flex items-center justify-center overflow-y-auto p-4 relative z-10">
        <div className="w-full max-w-5xl">
        {/* 상단: 아이콘, 이름, 메시지 */}
        <div className="text-center space-y-3 pt-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mx-auto">
            <Sparkles className="w-14 h-14 text-primary" />
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-medium text-gray-300">
              {name} 님의 결과
            </h2>
            {/* 결과 메시지 - 크고 강조된 형태 */}
            <div className="mt-4">
              <h1 
                className={`text-3xl font-bold ${
                  youngerLook 
                    ? "text-primary" 
                    : ageDifference > 0 
                    ? "text-gray-400" 
                    : "text-gray-300"
                }`}
                data-testid="result-message"
              >
                {message}
              </h1>
            </div>
          </div>
        </div>

        {/* 중앙: 이미지와 나이 정보를 세로로 배치 */}
        <div className="flex flex-col items-center gap-6 mt-6 mb-4">
          {/* 이미지 */}
          {capturedImage && (
            <div className="relative flex-shrink-0">
              <div className="w-80 h-80 rounded-2xl overflow-hidden border-4 border-primary/20 shadow-xl bg-gradient-to-br from-primary/5 to-primary/10 p-2">
                <div className="w-full h-full rounded-xl overflow-hidden">
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-full object-cover"
                    data-testid="img-captured"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 나이 정보 - PC에 맞게 크기 확대 */}
          <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
            <Card className="border-2 border-gray-700 bg-gray-900/90">
              <div className="pt-6 pb-6 text-center space-y-3">
                <p className="text-3xl text-gray-300">실제 나이</p>
                <p className="text-5xl font-bold text-white" data-testid="text-real-age">
                  {realAge}살
                </p>
              </div>
            </Card>
            <Card className="border-2 border-primary/30 bg-gray-900/90">
              <div className="pt-6 pb-6 text-center space-y-3">
                <p className="text-3xl text-gray-300">얼굴 나이</p>
                <p className="text-5xl font-bold text-primary" data-testid="text-face-age">
                  {faceAge}살
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* 하단: 나이 차이 메시지와 버튼 */}
        <div className="space-y-4 mt-4">
          {ageDifference !== 0 && (
            <div className="text-center py-2">
              <p className="text-2xl text-gray-300">
                실제보다{" "}
                <span className="font-semibold text-white" data-testid="text-age-difference">
                  {Math.abs(ageDifference)}살 {youngerLook ? "낮게" : "높게"}
                </span>{" "}
                나왔네요
              </p>
            </div>
          )}

          <div className="flex justify-center pb-2">
            <Button
              onClick={onReset}
              variant="default"
              size="lg"
              className="h-14 px-14 text-xl font-semibold shadow-lg"
              data-testid="button-reset"
            >
              <Home className="w-6 h-6 mr-2" />
              처음으로
            </Button>
          </div>
        </div>
        </div>
      </div>
      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
