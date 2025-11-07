import { useState } from "react";
import LoginForm from "@/components/LoginForm";
import WebcamCapture from "@/components/WebcamCapture";
import Countdown from "@/components/Countdown";
import LoadingAnalysis from "@/components/LoadingAnalysis";
import ResultDisplay from "@/components/ResultDisplay";

type Step = "login" | "webcam" | "countdown" | "loading" | "result";

export default function Home() {
  const [step, setStep] = useState<Step>("login");
  const [company, setCompany] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [capturedImage, setCapturedImage] = useState<string>("");
  const [estimatedAge, setEstimatedAge] = useState<number>(0);

  const handleLogin = (companyName: string, empId: string) => {
    setCompany(companyName);
    setEmployeeId(empId);
    setStep("webcam");
  };

  const handleCapture = (imageSrc: string) => {
    setCapturedImage(imageSrc);
    setStep("countdown");
  };

  const handleCountdownComplete = () => {
    setStep("loading");
    
    setTimeout(() => {
      const randomAge = Math.floor(Math.random() * 20) + 20;
      setEstimatedAge(randomAge);
      setStep("result");
    }, 2000);
  };

  const handleNewAttempt = () => {
    setCapturedImage("");
    setEstimatedAge(0);
    setStep("login");
  };

  const handleBack = () => {
    setStep("login");
  };

  return (
    <>
      {step === "login" && <LoginForm onSubmit={handleLogin} />}
      
      {step === "webcam" && (
        <WebcamCapture onCapture={handleCapture} onBack={handleBack} />
      )}
      
      {step === "countdown" && (
        <Countdown onComplete={handleCountdownComplete} />
      )}
      
      {step === "loading" && <LoadingAnalysis />}
      
      {step === "result" && (
        <ResultDisplay
          age={estimatedAge}
          capturedImage={capturedImage}
          company={company}
          employeeId={employeeId}
          onNewAttempt={handleNewAttempt}
        />
      )}
    </>
  );
}
