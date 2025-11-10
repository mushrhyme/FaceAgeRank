import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RotateCcw, Home } from "lucide-react";
import confetti from "canvas-confetti";
import Footer from "@/components/Footer";
import EventHeader from "@/components/EventHeader";

interface ResultDisplayProps {
  realAge: number;
  faceAge: number;
  capturedImage?: string;
  name: string;
  onRetry: () => void;
  onReset: () => void;
}

export default function ResultDisplay({
  realAge,
  faceAge,
  capturedImage,
  name,
  onRetry,
  onReset,
}: ResultDisplayProps) {
  const ageDifference = faceAge - realAge; // 얼굴 나이 - 실제 나이
  const isYoungerLook = ageDifference < 0; // 얼굴 나이가 실제 나이보다 작으면 동안
  const message = isYoungerLook ? "동안이시네요~" : ageDifference > 0 ? "노안이시네요~" : "실제 나이와 같아요!";

  // 결과 화면이 나타날 때 팡파레 효과 (동안일 때만)
  useEffect(() => {
    // 동안이 아닐 때는 팡파레 효과를 표시하지 않음
    if (!isYoungerLook) return;

    const duration = 5000; // 5초간 (더 오래 지속)
    const animationEnd = Date.now() + duration;
    const defaults = { 
      startVelocity: 30, 
      spread: 360, 
      ticks: 100, // 더 오래 지속되도록 증가
      zIndex: 0,
      gravity: 0.8, // 떨어지는 속도 조절
    };

    // 동안일 때는 파란색 계열
    const colors = ['#3b82f6', '#60a5fa', '#93c5fd', '#dbeafe']; // 파란색 계열

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: NodeJS.Timeout = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 80 * (timeLeft / duration); // 더 많은 파티클
      
      // 왼쪽에서 발사
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: colors,
      });
      
      // 오른쪽에서 발사
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: colors,
      });
    }, 200); // 더 자주 발사

    // 중앙에서 큰 폭발 효과 (여러 번)
    setTimeout(() => {
      confetti({
        ...defaults,
        particleCount: 150,
        origin: { x: 0.5, y: 0.3 },
        colors: colors,
        angle: 90,
        spread: 60,
      });
    }, 500);

    // 추가 폭발 효과
    setTimeout(() => {
      confetti({
        ...defaults,
        particleCount: 100,
        origin: { x: 0.3, y: 0.4 },
        colors: colors,
        angle: 60,
        spread: 45,
      });
      confetti({
        ...defaults,
        particleCount: 100,
        origin: { x: 0.7, y: 0.4 },
        colors: colors,
        angle: 120,
        spread: 45,
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isYoungerLook]);

  return (
    <div className="h-screen flex flex-col bg-background relative">
      <EventHeader />
      <div className="flex-1 overflow-y-auto p-6">
      {/* 상단: 아이콘, 이름, 메시지 */}
      <div className="text-center space-y-3 pt-24">
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 mx-auto">
          <Sparkles className="w-20 h-20 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-medium text-muted-foreground">
            {name} 님의 결과
          </h2>
          <Badge
            variant={isYoungerLook ? "default" : "secondary"}
            className="text-3xl px-5 py-1.5"
            data-testid="badge-message"
          >
            {message}
          </Badge>
        </div>
      </div>

      {/* 중앙: 이미지와 나이 정보를 세로로 배치 */}
      <div className="flex flex-col items-center gap-6 mt-6 mb-4">
        {/* 이미지 */}
        {capturedImage && (
          <div className="relative flex-shrink-0">
            <div className="w-96 h-96 rounded-2xl overflow-hidden border-4 border-primary/20 shadow-xl bg-gradient-to-br from-primary/5 to-primary/10 p-2">
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

        {/* 나이 정보 */}
        <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
          <Card className="border-2">
            <div className="pt-6 pb-6 text-center space-y-2">
              <p className="text-3xl text-muted-foreground">실제 나이</p>
              <p className="text-4xl font-bold" data-testid="text-real-age">
                {realAge}살
              </p>
            </div>
          </Card>
          <Card className="border-2 border-primary/30">
            <div className="pt-6 pb-6 text-center space-y-2">
              <p className="text-3xl text-muted-foreground">얼굴 나이</p>
              <p className="text-4xl font-bold text-primary" data-testid="text-face-age">
                {faceAge}살
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* 하단: 나이 차이 메시지와 버튼 */}
      <div className="space-y-8 mt-4">
        {ageDifference !== 0 && (
          <div className="text-center py-4">
            <p className="text-3xl text-muted-foreground">
              실제보다{" "}
              <span className="font-semibold text-foreground" data-testid="text-age-difference">
                {Math.abs(ageDifference)}살 {isYoungerLook ? "낮게" : "높게"}
              </span>{" "}
              나왔네요
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-4 justify-center pb-4">
          <Button
            onClick={onRetry}
            variant="default"
            className="h-20 px-16 text-2xl font-medium"
            data-testid="button-retry"
          >
            <RotateCcw className="w-6 h-6 mr-2" />
            다시 하기
          </Button>
          <Button
            onClick={onReset}
            variant="outline"
            className="h-20 px-16 text-2xl font-medium"
            data-testid="button-reset"
          >
            <Home className="w-6 h-6 mr-2" />
            맨 처음으로
          </Button>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}
