import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, RotateCcw, Home } from "lucide-react";

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
  const ageDifference = realAge - faceAge;
  const isYoungerLook = ageDifference > 0;
  const message = isYoungerLook ? "동안이시네요~" : ageDifference < 0 ? "노안이시네요~" : "실제 나이와 같아요!";

  return (
    <div className="h-screen flex flex-col justify-between p-8 bg-background overflow-hidden">
      {/* 상단: 아이콘, 이름, 메시지 */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mx-auto">
          <Sparkles className="w-12 h-12 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-medium text-muted-foreground">
            {name} 님의 결과
          </h2>
          <Badge
            variant={isYoungerLook ? "default" : "secondary"}
            className="text-xl px-5 py-1.5"
            data-testid="badge-message"
          >
            {message}
          </Badge>
        </div>
      </div>

      {/* 중앙: 이미지와 나이 정보를 세로로 배치 */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 my-4">
        {/* 이미지 */}
        {capturedImage && (
          <div className="relative flex-shrink-0">
            <div className="w-64 h-64 rounded-2xl overflow-hidden border-4 border-primary/20 shadow-xl bg-gradient-to-br from-primary/5 to-primary/10 p-1.5">
              <div className="w-full h-full rounded-xl overflow-hidden">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-full object-cover"
                  data-testid="img-captured"
                />
              </div>
            </div>
            <div className="absolute -top-3 -right-3 w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl shadow-lg">
              {faceAge}
            </div>
          </div>
        )}

        {/* 나이 정보 */}
        <div className="grid grid-cols-2 gap-6 max-w-2xl">
          <Card className="border-2">
            <div className="pt-6 pb-6 text-center space-y-2">
              <p className="text-lg text-muted-foreground">실제 나이</p>
              <p className="text-4xl font-bold" data-testid="text-real-age">
                {realAge}살
              </p>
            </div>
          </Card>
          <Card className="border-2 border-primary/30">
            <div className="pt-6 pb-6 text-center space-y-2">
              <p className="text-lg text-muted-foreground">얼굴 나이</p>
              <p className="text-4xl font-bold text-primary" data-testid="text-face-age">
                {faceAge}살
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* 하단: 나이 차이 메시지와 버튼 */}
      <div className="space-y-4">
        {ageDifference !== 0 && (
          <div className="text-center">
            <p className="text-xl text-muted-foreground">
              실제보다{" "}
              <span className="font-semibold text-foreground" data-testid="text-age-difference">
                {Math.abs(ageDifference)}살 {isYoungerLook ? "어려" : "많아"}
              </span>{" "}
              보여요
            </p>
          </div>
        )}

        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            onClick={onRetry}
            variant="default"
            className="h-16 px-10 text-xl font-medium"
            data-testid="button-retry"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            다시 하기
          </Button>
          <Button
            onClick={onReset}
            variant="outline"
            className="h-16 px-10 text-xl font-medium"
            data-testid="button-reset"
          >
            <Home className="w-5 h-5 mr-2" />
            맨 처음으로
          </Button>
        </div>
      </div>
    </div>
  );
}
