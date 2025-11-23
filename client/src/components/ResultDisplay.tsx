import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Home, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import Footer from "@/components/Footer";
import EventHeader from "@/components/EventHeader";
import MatrixBackground from "@/components/MatrixBackground";
import { useYoungerConfetti } from "@/hooks/useYoungerConfetti";
import { useOlderRipple } from "@/hooks/useOlderRipple";
import { getResultMessage, isYoungerLook } from "@/lib/resultUtils";
import { soundManager, SOUNDS } from "@/lib/sound";
import { apiRequest } from "@/lib/queryClient";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ResultDisplayProps {
  realAge: number;
  faceAge: number;
  capturedImage?: string;
  name: string;
  onReset: () => void;
  isMobileMode?: boolean; // 모바일 모드 강제 적용 (QR 코드 접속 시)
}

export default function ResultDisplay({
  realAge,
  faceAge,
  capturedImage,
  name,
  onReset,
  isMobileMode = false,
}: ResultDisplayProps) {
  const isMobile = useIsMobile(); // 화면 크기 기반 모바일 감지
  const shouldUseMobileLayout = isMobileMode || isMobile; // QR 코드 접속이거나 모바일 화면이면 모바일 레이아웃
  const ageDifference = faceAge - realAge; // 얼굴 나이 - 실제 나이
  const youngerLook = isYoungerLook(ageDifference); // 동안 여부
  const olderLook = ageDifference > 0; // 노안 여부
  const message = getResultMessage(ageDifference); // 결과 메시지
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false); // QR 코드 다이얼로그 열림 상태
  const [imageUrl, setImageUrl] = useState<string | null>(null); // 서버에 업로드된 이미지 URL

  // 이미지 업로드 (컴포넌트 마운트 시)
  useEffect(() => {
    if (capturedImage) {
      // 이미지를 서버에 업로드
      apiRequest("POST", "/api/image/upload", {
        image: capturedImage,
      })
        .then((response) => response.json())
        .then((data: { imageUrl: string }) => {
          // 상대 경로를 절대 URL로 변환
          const absoluteUrl = data.imageUrl.startsWith("http") 
            ? data.imageUrl 
            : `${window.location.origin}${data.imageUrl}`;
          console.log("이미지 업로드 완료:", absoluteUrl);
          setImageUrl(absoluteUrl);
        })
        .catch((error) => {
          console.error("이미지 업로드 실패:", error);
          // 업로드 실패해도 계속 진행
        });
    }
  }, [capturedImage]);

  // QR 코드에 포함할 결과 URL 생성 (이미지 URL 포함)
  const resultUrl = useMemo(() => {
    const resultData = {
      name,
      realAge,
      faceAge,
      ageDifference,
      message,
      imageUrl: imageUrl || "", // 서버에 업로드된 이미지 URL
    };
    // 한글을 포함한 문자열을 안전하게 인코딩 (TextEncoder 사용)
    const jsonString = JSON.stringify(resultData);
    const utf8Bytes = new TextEncoder().encode(jsonString);
    // 바이트 배열을 Base64로 변환
    let binaryString = '';
    for (let i = 0; i < utf8Bytes.length; i++) {
      binaryString += String.fromCharCode(utf8Bytes[i]);
    }
    const encodedData = btoa(binaryString); // Base64 인코딩
    const baseUrl = window.location.origin;
    // URL-safe하게 인코딩 (특수 문자 처리)
    return `${baseUrl}/?result=${encodeURIComponent(encodedData)}`;
  }, [name, realAge, faceAge, ageDifference, message, imageUrl]);

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
      <div className={`flex-1 flex items-center justify-center overflow-y-auto ${shouldUseMobileLayout ? 'p-3 pt-20' : 'p-4'} relative z-10`}>
        <div className={`w-full ${shouldUseMobileLayout ? 'max-w-md' : 'max-w-5xl'}`}>
        {/* 상단: 아이콘, 이름, 메시지 */}
        <div className={`text-center ${shouldUseMobileLayout ? 'space-y-2 pt-1' : 'space-y-3 pt-4'}`}>
          <div className={`inline-flex items-center justify-center ${shouldUseMobileLayout ? 'w-12 h-12' : 'w-20 h-20'} rounded-full bg-primary/10 mx-auto`}>
            <Sparkles className={`${shouldUseMobileLayout ? "w-8 h-8" : "w-14 h-14"} text-primary`} />
          </div>
          <div className={shouldUseMobileLayout ? "space-y-1" : "space-y-3"}>
            <h2 className={`${shouldUseMobileLayout ? 'text-base' : 'text-xl'} font-medium text-gray-300`}>
              {name} 님의 결과
            </h2>
            {/* 결과 메시지 - 크고 강조된 형태 */}
            <div className={shouldUseMobileLayout ? "mt-2" : "mt-4"}>
              <h1 
                className={`${shouldUseMobileLayout ? 'text-xl' : 'text-3xl'} font-bold ${
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
        <div className={`flex flex-col items-center ${shouldUseMobileLayout ? 'gap-3 mt-3' : 'gap-6 mt-6'} mb-4`}>
          {/* 이미지 */}
          {capturedImage && (
            <div className="relative flex-shrink-0">
              <div className={`${shouldUseMobileLayout ? 'w-56 h-56' : 'w-80 h-80'} rounded-2xl overflow-hidden border-4 border-primary/20 shadow-xl bg-gradient-to-br from-primary/5 to-primary/10 p-2`}>
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

          {/* 나이 정보 - 모바일/PC에 맞게 크기 조정 */}
          <div className={`grid ${shouldUseMobileLayout ? 'grid-cols-2 gap-2' : 'grid-cols-2 gap-6'} w-full ${shouldUseMobileLayout ? 'max-w-xs' : 'max-w-2xl'}`}>
            <Card className="border-2 border-gray-700 bg-gray-900/90">
              <div className={`${shouldUseMobileLayout ? 'pt-3 pb-3' : 'pt-6 pb-6'} text-center ${shouldUseMobileLayout ? 'space-y-1' : 'space-y-3'}`}>
                <p className={`${shouldUseMobileLayout ? 'text-sm' : 'text-3xl'} text-gray-300`}>실제 나이</p>
                <p className={`${shouldUseMobileLayout ? 'text-2xl' : 'text-5xl'} font-bold text-white`} data-testid="text-real-age">
                  {realAge}살
                </p>
              </div>
            </Card>
            <Card className="border-2 border-primary/30 bg-gray-900/90">
              <div className={`${shouldUseMobileLayout ? 'pt-3 pb-3' : 'pt-6 pb-6'} text-center ${shouldUseMobileLayout ? 'space-y-1' : 'space-y-3'}`}>
                <p className={`${shouldUseMobileLayout ? 'text-sm' : 'text-3xl'} text-gray-300`}>얼굴 나이</p>
                <p className={`${shouldUseMobileLayout ? 'text-2xl' : 'text-5xl'} font-bold text-primary`} data-testid="text-face-age">
                  {faceAge}살
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* 하단: 나이 차이 메시지와 버튼 */}
        <div className={`${shouldUseMobileLayout ? 'space-y-3 mt-2' : 'space-y-4 mt-4'}`}>
          {ageDifference !== 0 && (
            <div className={`text-center ${shouldUseMobileLayout ? 'py-1' : 'py-2'}`}>
              <p className={`${shouldUseMobileLayout ? 'text-sm' : 'text-2xl'} text-gray-300`}>
                실제보다{" "}
                <span className="font-semibold text-white" data-testid="text-age-difference">
                  {Math.abs(ageDifference)}살 {youngerLook ? "낮게" : "높게"}
                </span>{" "}
                나왔네요
              </p>
            </div>
          )}

          <div className={`flex justify-center ${shouldUseMobileLayout ? 'flex-col gap-3' : 'gap-4'} pb-2`}>
            {!isMobileMode && (
              <Button
                onClick={() => setIsQrDialogOpen(true)}
                variant="outline"
                size={shouldUseMobileLayout ? "default" : "lg"}
                className={`${shouldUseMobileLayout ? 'h-12 px-6 text-base' : 'h-14 px-8 text-xl'} font-semibold shadow-lg border-primary/30 text-primary hover:bg-primary/10 w-full`}
                data-testid="button-qr"
              >
                <QrCode className={`${shouldUseMobileLayout ? 'w-5 h-5' : 'w-6 h-6'} mr-2`} />
                QR 코드
              </Button>
            )}
            <Button
              onClick={onReset}
              variant="default"
              size={shouldUseMobileLayout ? "default" : "lg"}
              className={`${shouldUseMobileLayout ? 'h-12 px-8 text-base' : 'h-14 px-14 text-xl'} font-semibold shadow-lg w-full`}
              data-testid="button-reset"
            >
              <Home className={`${shouldUseMobileLayout ? 'w-5 h-5' : 'w-6 h-6'} mr-2`} />
              처음으로
            </Button>
          </div>
        </div>
        </div>
      </div>
      <div className="relative z-10">
        <Footer />
      </div>

      {/* QR 코드 다이얼로그 */}
      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent className="max-w-md bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white text-center">
              결과 QR 코드
            </DialogTitle>
            <DialogDescription className="text-center text-gray-300 pt-2">
              QR 코드를 스캔하여 결과를 확인하세요
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-6 pt-4 pb-4">
            {imageUrl ? (
              <>
                <div className="bg-white p-4 rounded-lg">
                  <QRCodeSVG
                    value={resultUrl}
                    size={256}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-400">
                    {name} 님의 결과
                  </p>
                  <p className="text-xs text-gray-500 break-all px-4">
                    {resultUrl}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center space-y-2 py-8">
                <p className="text-gray-400">이미지 업로드 중...</p>
                <p className="text-xs text-gray-500">잠시만 기다려주세요</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
