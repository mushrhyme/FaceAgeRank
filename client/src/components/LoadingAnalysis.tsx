import { Loader2 } from "lucide-react";
import Footer from "@/components/Footer";
import EventHeader from "@/components/EventHeader";

export default function LoadingAnalysis() {
  return (
    <div className="h-screen flex flex-col bg-background relative">
      <EventHeader />
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-12">
        <div className="relative">
          <div className="w-40 h-40 mx-auto">
            <Loader2
              className="w-full h-full text-primary animate-spin"
              strokeWidth={2}
            />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 rounded-full bg-primary/10 animate-pulse" />
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-semibold" data-testid="text-loading">
            분석 중...
          </h2>
          <p className="text-2xl text-muted-foreground">
            AI가 얼굴 나이를 분석하고 있습니다
          </p>
        </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
