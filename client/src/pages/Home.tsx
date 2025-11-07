import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import LoginForm from "@/components/LoginForm";
import WelcomeScreen from "@/components/WelcomeScreen";
import CaptureGuide from "@/components/CaptureGuide";
import WebcamCapture from "@/components/WebcamCapture";
import LoadingAnalysis from "@/components/LoadingAnalysis";
import ResultDisplay from "@/components/ResultDisplay";

type Step = "login" | "welcome" | "guide" | "webcam" | "loading" | "result";

export default function Home() {
  const [step, setStep] = useState<Step>("login");
  const [user, setUser] = useState<User | null>(null);
  const [capturedImage, setCapturedImage] = useState<string>("");
  const [faceAge, setFaceAge] = useState<number>(0);
  const { toast } = useToast();

  const handleLogin = async (company: string, employeeId: string) => {
    try {
      const response = await apiRequest("POST", "/api/user/lookup", {
        company,
        employeeId,
      });
      
      const userData = await response.json() as User;
      setUser(userData);
      setStep("welcome");
    } catch (error) {
      toast({
        title: "오류",
        description: "사용자 정보를 찾을 수 없습니다.",
        variant: "destructive",
      });
    }
  };

  const handleWelcomeContinue = () => {
    setStep("guide");
  };

  const handleGuideStart = () => {
    setStep("webcam");
  };

  const handleCapture = (imageSrc: string) => {
    setCapturedImage(imageSrc);
    setStep("loading");
    
    setTimeout(() => {
      const randomFaceAge = 20;
      setFaceAge(randomFaceAge);
      setStep("result");
    }, 2000);
  };

  const handleRetry = () => {
    setCapturedImage("");
    setFaceAge(0);
    setStep("guide");
  };

  const handleReset = () => {
    setCapturedImage("");
    setFaceAge(0);
    setUser(null);
    setStep("login");
  };

  return (
    <>
      {step === "login" && <LoginForm onSubmit={handleLogin} />}
      
      {step === "welcome" && user && (
        <WelcomeScreen name={user.name} onContinue={handleWelcomeContinue} />
      )}
      
      {step === "guide" && (
        <CaptureGuide onStart={handleGuideStart} />
      )}
      
      {step === "webcam" && (
        <WebcamCapture onCapture={handleCapture} />
      )}
      
      {step === "loading" && <LoadingAnalysis />}
      
      {step === "result" && user && (
        <ResultDisplay
          realAge={user.realAge}
          faceAge={faceAge}
          capturedImage={capturedImage}
          name={user.name}
          onRetry={handleRetry}
          onReset={handleReset}
        />
      )}
    </>
  );
}
