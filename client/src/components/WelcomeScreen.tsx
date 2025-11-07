import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserCheck } from "lucide-react";

interface WelcomeScreenProps {
  name: string;
  onContinue: () => void;
}

export default function WelcomeScreen({ name, onContinue }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-xl">
        <CardContent className="pt-12 pb-12 text-center space-y-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mx-auto">
            <UserCheck className="w-10 h-10 text-primary" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold" data-testid="text-welcome-name">
              {name} 님
            </h1>
            <p className="text-2xl font-semibold text-primary">
              환영합니다!
            </p>
          </div>

          <p className="text-muted-foreground">
            얼굴 나이 측정을 시작하겠습니다
          </p>

          <div className="pt-4">
            <Button
              onClick={onContinue}
              className="h-12 px-8 text-base font-medium min-w-48"
              data-testid="button-continue"
            >
              다음
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
