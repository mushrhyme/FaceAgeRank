import { Button } from "@/components/ui/button";
import { Camera, CheckCircle2 } from "lucide-react";

interface CaptureGuideProps {
  onStart: () => void;
}

export default function CaptureGuide({ onStart }: CaptureGuideProps) {
  return (
    <div className="h-screen flex flex-col items-center justify-center p-8 bg-background">
      <div className="w-full max-w-6xl">
        {/* 헤더 */}
        <div className="text-center pb-8 mb-8">
          <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <Camera className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-4xl font-semibold mb-4">촬영 안내</h1>
          <p className="text-xl text-muted-foreground">
            아래 안내에 따라 촬영을 진행해주세요
          </p>
        </div>

        {/* 안내 사항 */}
        <div className="space-y-6 max-w-3xl mx-auto mb-12">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
            <p className="text-xl text-muted-foreground pt-1">
              밝은 조명 아래에서 촬영해주세요
            </p>
          </div>
          <div className="flex items-start gap-4">
            <CheckCircle2 className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
            <p className="text-xl text-muted-foreground pt-1">
              얼굴이 화면 중앙의 가이드라인 안에 오도록 위치해주세요
            </p>
          </div>
          <div className="flex items-start gap-4">
            <CheckCircle2 className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
            <p className="text-xl text-muted-foreground pt-1">
              카메라를 정면으로 바라봐주세요
            </p>
          </div>
          <div className="flex items-start gap-4">
            <CheckCircle2 className="w-8 h-8 text-primary mt-1 flex-shrink-0" />
            <p className="text-xl text-muted-foreground pt-1">
              촬영 시작 버튼을 누르면 3초 후 자동으로 촬영됩니다
            </p>
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex justify-center">
          <Button
            onClick={onStart}
            className="h-16 px-16 text-xl font-medium min-w-64"
            data-testid="button-start-capture"
          >
            촬영 시작
          </Button>
        </div>
      </div>
    </div>
  );
}
