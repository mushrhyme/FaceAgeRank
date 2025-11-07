import { useRef, useState, useCallback } from "react";
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

  const handleUserMedia = useCallback(() => {
    setHasPermission(true);
    setError("");
  }, []);

  const handleUserMediaError = useCallback(() => {
    setHasPermission(false);
    setError("카메라 접근 권한이 필요합니다. 브라우저 설정에서 카메라를 허용해주세요.");
  }, []);

  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
    }
  }, [onCapture]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      {onBack && (
        <Button
          variant="ghost"
          onClick={onBack}
          className="absolute top-4 left-4"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          뒤로
        </Button>
      )}

      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">카메라 준비</h1>
          <p className="text-muted-foreground">
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
          </div>

          {hasPermission && (
            <Badge
              className="absolute top-4 right-4 bg-green-500/90 text-white backdrop-blur-sm"
              data-testid="badge-camera-active"
            >
              <div className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse" />
              카메라 활성
            </Badge>
          )}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {hasPermission && (
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleCapture}
              className="h-12 px-8 text-base font-medium min-w-48"
              data-testid="button-start"
            >
              <Camera className="w-5 h-5 mr-2" />
              시작
            </Button>
          </div>
        )}

        {hasPermission === false && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="h-12 px-8"
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
