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
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-6xl">
        <Card className="shadow-xl">
          <CardContent className="pt-16 pb-16 space-y-12">
            <div className="text-center space-y-8">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 mx-auto">
                <Sparkles className="w-16 h-16 text-primary" />
              </div>

              <div className="space-y-4">
                <h2 className="text-3xl font-medium text-muted-foreground">
                  {name} 님의 결과
                </h2>
                <Badge
                  variant={isYoungerLook ? "default" : "secondary"}
                  className="text-2xl px-6 py-2"
                  data-testid="badge-message"
                >
                  {message}
                </Badge>
              </div>
            </div>

            {capturedImage && (
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-80 h-80 rounded-2xl overflow-hidden border-8 border-primary/20 shadow-xl bg-gradient-to-br from-primary/5 to-primary/10 p-2">
                    <div className="w-full h-full rounded-xl overflow-hidden">
                      <img
                        src={capturedImage}
                        alt="Captured"
                        className="w-full h-full object-cover"
                        data-testid="img-captured"
                      />
                    </div>
                  </div>
                  <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-2xl shadow-lg">
                    {faceAge}
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto">
              <Card className="border-2">
                <CardContent className="pt-10 pb-10 text-center space-y-3">
                  <p className="text-xl text-muted-foreground">실제 나이</p>
                  <p className="text-5xl font-bold" data-testid="text-real-age">
                    {realAge}살
                  </p>
                </CardContent>
              </Card>
              <Card className="border-2 border-primary/30">
                <CardContent className="pt-10 pb-10 text-center space-y-3">
                  <p className="text-xl text-muted-foreground">얼굴 나이</p>
                  <p className="text-5xl font-bold text-primary" data-testid="text-face-age">
                    {faceAge}살
                  </p>
                </CardContent>
              </Card>
            </div>

            {ageDifference !== 0 && (
              <div className="text-center">
                <p className="text-2xl text-muted-foreground">
                  실제보다{" "}
                  <span className="font-semibold text-foreground" data-testid="text-age-difference">
                    {Math.abs(ageDifference)}살 {isYoungerLook ? "어려" : "많아"}
                  </span>{" "}
                  보여요
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-4 justify-center pt-8">
              <Button
                onClick={onRetry}
                variant="default"
                className="h-16 px-12 text-xl font-medium"
                data-testid="button-retry"
              >
                <RotateCcw className="w-6 h-6 mr-2" />
                다시 하기
              </Button>
              <Button
                onClick={onReset}
                variant="outline"
                className="h-16 px-12 text-xl font-medium"
                data-testid="button-reset"
              >
                <Home className="w-6 h-6 mr-2" />
                맨 처음으로
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
