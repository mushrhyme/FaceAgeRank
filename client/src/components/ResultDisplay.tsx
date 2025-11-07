import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardContent className="pt-12 pb-12 space-y-8">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mx-auto">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-medium text-muted-foreground">
                {name} 님의 결과
              </h2>
              <Badge
                variant={isYoungerLook ? "default" : "secondary"}
                className="text-lg px-4 py-1"
                data-testid="badge-message"
              >
                {message}
              </Badge>
            </div>
          </div>

          {capturedImage && (
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-48 h-48 rounded-2xl overflow-hidden border-8 border-primary/20 shadow-xl bg-gradient-to-br from-primary/5 to-primary/10 p-2">
                  <div className="w-full h-full rounded-xl overflow-hidden">
                    <img
                      src={capturedImage}
                      alt="Captured"
                      className="w-full h-full object-cover"
                      data-testid="img-captured"
                    />
                  </div>
                </div>
                <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-lg">
                  {faceAge}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            <Card className="border-2">
              <CardContent className="pt-6 pb-6 text-center space-y-2">
                <p className="text-sm text-muted-foreground">실제 나이</p>
                <p className="text-3xl font-bold" data-testid="text-real-age">
                  {realAge}살
                </p>
              </CardContent>
            </Card>
            <Card className="border-2 border-primary/30">
              <CardContent className="pt-6 pb-6 text-center space-y-2">
                <p className="text-sm text-muted-foreground">얼굴 나이</p>
                <p className="text-3xl font-bold text-primary" data-testid="text-face-age">
                  {faceAge}살
                </p>
              </CardContent>
            </Card>
          </div>

          {ageDifference !== 0 && (
            <div className="text-center">
              <p className="text-lg text-muted-foreground">
                실제보다{" "}
                <span className="font-semibold text-foreground" data-testid="text-age-difference">
                  {Math.abs(ageDifference)}살 {isYoungerLook ? "어려" : "많아"}
                </span>{" "}
                보여요
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-3 justify-center pt-4">
            <Button
              onClick={onRetry}
              variant="default"
              className="h-12 px-8 text-base font-medium"
              data-testid="button-retry"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              다시 하기
            </Button>
            <Button
              onClick={onReset}
              variant="outline"
              className="h-12 px-8 text-base font-medium"
              data-testid="button-reset"
            >
              <Home className="w-5 h-5 mr-2" />
              맨 처음으로
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
