import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, RotateCcw } from "lucide-react";

interface ResultDisplayProps {
  age: number;
  capturedImage?: string;
  company: string;
  employeeId: string;
  onNewAttempt: () => void;
}

export default function ResultDisplay({
  age,
  capturedImage,
  company,
  employeeId,
  onNewAttempt,
}: ResultDisplayProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardContent className="pt-12 pb-12 text-center space-y-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mx-auto">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>

          <div className="space-y-4">
            <h1 className="text-lg text-muted-foreground font-medium">
              당신의 얼굴 나이는
            </h1>
            <div
              className="text-6xl font-bold text-primary"
              data-testid="text-age-result"
            >
              {age}살
            </div>
            <p className="text-lg text-muted-foreground">입니다</p>
          </div>

          {capturedImage && (
            <div className="flex justify-center">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-card-border shadow-md">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-full object-cover"
                  data-testid="img-captured"
                />
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground space-y-1">
            <p>{company}</p>
            <p>사번: {employeeId}</p>
          </div>

          <div className="pt-4">
            <Button
              onClick={onNewAttempt}
              className="h-12 px-8 text-base font-medium min-w-48"
              data-testid="button-new-attempt"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              다시 측정하기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
