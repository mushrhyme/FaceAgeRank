import { Loader2 } from "lucide-react";

export default function LoadingAnalysis() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="text-center space-y-8">
        <div className="relative">
          <div className="w-24 h-24 mx-auto">
            <Loader2
              className="w-full h-full text-primary animate-spin"
              strokeWidth={2}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold" data-testid="text-loading">
            분석 중...
          </h2>
          <p className="text-muted-foreground">
            AI가 얼굴 나이를 분석하고 있습니다
          </p>
        </div>
      </div>
    </div>
  );
}
