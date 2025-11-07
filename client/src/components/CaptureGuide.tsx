import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, CheckCircle2 } from "lucide-react";

interface CaptureGuideProps {
  onStart: () => void;
}

export default function CaptureGuide({ onStart }: CaptureGuideProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Camera className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-semibold">촬영 안내</CardTitle>
          <CardDescription className="text-base">
            아래 안내에 따라 촬영을 진행해주세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-muted-foreground">
                밝은 조명 아래에서 촬영해주세요
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-muted-foreground">
                얼굴이 화면 중앙의 가이드라인 안에 오도록 위치해주세요
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-muted-foreground">
                카메라를 정면으로 바라봐주세요
              </p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-muted-foreground">
                촬영 시작 버튼을 누르면 3초 후 자동으로 촬영됩니다
              </p>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <Button
              onClick={onStart}
              className="h-12 px-8 text-base font-medium min-w-48"
              data-testid="button-start-capture"
            >
              촬영 시작
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
