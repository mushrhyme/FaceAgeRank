import { useRef, useState, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import EventHeader from "@/components/EventHeader";

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
  onBack?: () => void;
}

export default function WebcamCapture({
  onCapture,
  onBack,
}: WebcamCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string>("");
  const [countdown, setCountdown] = useState<number | null>(null);

  const handleUserMedia = useCallback(() => {
    setHasPermission(true);
    setError("");
  }, []);

  const handleUserMediaError = useCallback((error: string | DOMException) => {
    setHasPermission(false);
    
    // 에러 타입에 따라 다른 메시지 표시
    let errorMessage = "카메라 접근에 실패했습니다.";
    
    if (error instanceof DOMException) {
      switch (error.name) {
        case "NotAllowedError":
          errorMessage = "카메라 접근 권한이 거부되었습니다. 브라우저 설정에서 카메라를 허용해주세요.";
          break;
        case "NotFoundError":
          errorMessage = "카메라를 찾을 수 없습니다. 카메라가 연결되어 있는지 확인해주세요.";
          break;
        case "NotReadableError":
          errorMessage = "카메라가 다른 앱에서 사용 중이거나 접근할 수 없습니다.";
          break;
        case "OverconstrainedError":
          errorMessage = "요청한 카메라 설정을 지원하지 않습니다.";
          break;
        default:
          errorMessage = `카메라 오류: ${error.message || error.name}`;
      }
    } else if (typeof error === "string") {
      errorMessage = error;
    }
    
    console.error("카메라 접근 오류:", error);
    setError(errorMessage);
  }, []);

  // 이미지 압축 함수 (Base64 이미지 크기 줄이기)
  const compressImage = useCallback((base64Image: string, maxWidth = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // 비율 유지하면서 크기 조정
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // JPEG로 압축 (quality로 품질 조절)
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        } else {
          resolve(base64Image); // 실패 시 원본 반환
        }
      };
      img.onerror = () => resolve(base64Image); // 에러 시 원본 반환
      img.src = base64Image;
    });
  }, []);

  const handleStartCountdown = useCallback(() => {
    setCountdown(3);
  }, []);

  useEffect(() => {
    if (countdown === null) return;

    if (countdown === 0) {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc) {
        // 이미지 압축 후 전달
        compressImage(imageSrc).then((compressedImage) => {
          onCapture(compressedImage);
        });
      }
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onCapture]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative">
      <EventHeader />
      {onBack && (
        <Button
          variant="ghost"
          onClick={onBack}
          className="absolute top-6 left-6 h-12 px-5 text-base"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          뒤로
        </Button>
      )}

      <div className="w-full max-w-5xl space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-semibold">카메라 준비</h1>
          <p className="text-lg text-muted-foreground">
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
                    <linearGradient
                      id="guideline-gradient"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="white" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="white" stopOpacity="0.3" />
                    </linearGradient>
                  </defs>

                  {/* 사람 실루엣 가이드라인 - 머리(원형) + 몸통(위가 둥근 반원) */}
                  <g 
                    fill="none" 
                    stroke="url(#guideline-gradient)" 
                    strokeWidth="3" 
                    strokeDasharray="10,8"
                  >
                    {/* 머리 */}
                    <circle
                      cx="640"
                      cy="240"
                      r="200"
                    />
                    {/* 몸통 */}
                    <path
                      d="M 640 460 
                         c -100 0 -300 50 -300 150 
                         v 80 
                         h 600 
                         v -80 
                         c 0 -100 -200 -150 -300 -150 z"
                    />
                  </g>

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

        {/* 버튼 영역 - 고정 높이로 레이아웃 시프트 방지 */}
        <div className="flex justify-center min-h-[100px] items-center">
          {hasPermission === false ? (
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="h-16 px-12 text-xl font-medium"
              data-testid="button-retry"
            >
              다시 시도
            </Button>
          ) : (
            <Button
              onClick={handleStartCountdown}
              disabled={!hasPermission || countdown !== null}
              className="h-16 px-12 text-xl font-medium min-w-64"
              data-testid="button-start"
            >
              <Camera className="w-5 h-5 mr-2" />
              시작
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
