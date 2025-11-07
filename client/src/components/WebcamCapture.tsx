import { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
  onBack?: () => void;
}

export default function WebcamCapture({ onCapture, onBack }: WebcamCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string>("");
  const [countdown, setCountdown] = useState<number | null>(null);

  const handleUserMedia = useCallback(() => {
    setHasPermission(true);
    setError("");
  }, []);

  const handleUserMediaError = useCallback(() => {
    setHasPermission(false);
    setError("카메라 접근 권한이 필요합니다. 브라우저 설정에서 카메라를 허용해주세요.");
  }, []);

  const handleStartCountdown = useCallback(() => {
    setCountdown(3);
  }, []);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc) {
        onCapture(imageSrc);
      }
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onCapture]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-background">
      {onBack && (
        <Button
          variant="ghost"
          onClick={onBack}
          className="absolute top-8 left-8 h-14 px-6 text-lg"
          data-testid="button-back"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          뒤로
        </Button>
      )}

      <div className="w-full max-w-6xl space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-semibold">카메라 준비</h1>
          <p className="text-xl text-muted-foreground">
            얼굴이 화면 중앙에 오도록 위치를 조정하세요
          </p>
        </div>

        <div className="relative">
          <div className="rounded-xl overflow-hidden bg-card border border-card-border shadow-lg aspect-video">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                width: 1280,
                height: 720,
                facingMode: "user",
              }}
              onUserMedia={handleUserMedia}
              onUserMediaError={handleUserMediaError}
              className="w-full h-full object-cover"
            />
            
            {hasPermission && (
              <div className="absolute inset-0 pointer-events-none">
                <svg
                  viewBox="0 0 1280 720"
                  className="w-full h-full"
                  preserveAspectRatio="xMidYMid slice"
                >
                  <defs>
                    <linearGradient id="guideline-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="white" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="white" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>
                  
                  <ellipse
                    cx="640"
                    cy="280"
                    rx="180"
                    ry="200"
                    fill="none"
                    stroke="url(#guideline-gradient)"
                    strokeWidth="3"
                    strokeDasharray="10,8"
                  />
                  
                  <path
                    d="M 460 450 Q 460 520, 500 580 L 500 680 M 780 450 Q 780 520, 740 580 L 740 680 M 500 680 L 740 680"
                    fill="none"
                    stroke="url(#guideline-gradient)"
                    strokeWidth="3"
                    strokeDasharray="10,8"
                  />
                  
                  <text
                    x="640"
                    y="650"
                    textAnchor="middle"
                    fill="white"
                    fontSize="24"
                    fontWeight="500"
                    opacity="0.8"
                  >
                    가이드라인 안에 위치해주세요
                  </text>
                </svg>
              </div>
            )}

            {/* 카운트다운 오버레이 - 웹캠 위에만 표시 */}
            {countdown !== null && countdown > 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative">
                  <div
                    className="text-white font-bold transition-all duration-300 drop-shadow-[0_0_30px_rgba(0,0,0,0.9)]"
                    style={{
                      fontSize: "16rem",
                      lineHeight: 1,
                      animation: "scaleIn 0.3s ease-out",
                    }}
                    data-testid="text-countdown"
                  >
                    {countdown}
                  </div>
                  <div
                    className="absolute inset-0 rounded-full border-4 border-white/20"
                    style={{
                      width: "16rem",
                      height: "16rem",
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                </div>
                <style>{`
                  @keyframes scaleIn {
                    0% {
                      transform: scale(0.5);
                      opacity: 0;
                    }
                    50% {
                      transform: scale(1.1);
                    }
                    100% {
                      transform: scale(1);
                      opacity: 1;
                    }
                  }
                `}</style>
              </div>
            )}
          </div>

          {hasPermission && (
            <Badge
              className="absolute top-6 right-6 bg-green-500/90 text-white backdrop-blur-sm text-lg px-4 py-2"
              data-testid="badge-camera-active"
            >
              <div className="w-3 h-3 rounded-full bg-white mr-2 animate-pulse" />
              카메라 활성
            </Badge>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {hasPermission && countdown === null && (
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleStartCountdown}
              className="h-16 px-16 text-xl font-medium min-w-64"
              data-testid="button-start"
            >
              <Camera className="w-6 h-6 mr-2" />
              시작
            </Button>
          </div>
        )}


        {hasPermission === false && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="h-16 px-16 text-xl font-medium"
              data-testid="button-retry"
            >
              다시 시도
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
