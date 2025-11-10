import { Button } from "@/components/ui/button";
import { UserCheck } from "lucide-react";

interface WelcomeScreenProps {
  name: string;
  onContinue: () => void;
}

export default function WelcomeScreen({
  name,
  onContinue,
}: WelcomeScreenProps) {
  return (
    <div className="h-screen flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-6xl text-center space-y-12">
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 mx-auto">
          <UserCheck className="w-20 h-20 text-primary" />
        </div>

        <div className="space-y-4">
          <h1 className="text-6xl font-bold" data-testid="text-welcome-name">
            {name} 님
          </h1>

          <p className="text-5xl font-semibold text-primary mt-[15px]">
            환영합니다!
          </p>
        </div>

        <p className="text-3xl text-muted-foreground">
          얼굴 나이 측정을 시작하겠습니다
        </p>

        <div className="pt-8">
          <Button
            onClick={onContinue}
            className="h-20 px-16 text-2xl font-medium min-w-80"
            data-testid="button-continue"
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}
