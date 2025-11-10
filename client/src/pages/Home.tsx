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
  const [loginInfo, setLoginInfo] = useState<{ company: string; employeeId: string } | null>(null); // 로그인 시 입력한 정보 저장
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
      setLoginInfo({ company, employeeId }); // 로그인 정보 저장
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

  const handleCapture = async (imageSrc: string) => {
    setCapturedImage(imageSrc);
    setStep("loading");
    
    // 분석 시뮬레이션 (실제로는 AI 분석 API 호출)
    setTimeout(async () => {
      const randomFaceAge = 20;
      setFaceAge(randomFaceAge);
      setStep("result");

      // 분석 결과를 구글 시트에 저장
      if (user && loginInfo) {
        try {
          const ageDifference = user.realAge - randomFaceAge; // 실제 나이 - 얼굴 나이
          // 한국 시간대(KST)로 변환하여 읽기 쉬운 형식으로 포맷팅: "2025-11-07 22:20:47"
          const now = new Date();
          const kstOffset = 9 * 60; // KST는 UTC+9 (분 단위)
          const kstTime = new Date(now.getTime() + (kstOffset + now.getTimezoneOffset()) * 60000);
          const year = kstTime.getFullYear();
          const month = String(kstTime.getMonth() + 1).padStart(2, "0");
          const day = String(kstTime.getDate()).padStart(2, "0");
          const hours = String(kstTime.getHours()).padStart(2, "0");
          const minutes = String(kstTime.getMinutes()).padStart(2, "0");
          const seconds = String(kstTime.getSeconds()).padStart(2, "0");
          const completedAt = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

          console.log("📤 구글 시트 저장 요청 전송:", {
            company: loginInfo.company,
            employeeId: loginInfo.employeeId,
            name: user.name,
            realAge: user.realAge,
            faceAge: randomFaceAge,
          });

          const response = await apiRequest("POST", "/api/analysis/save", {
            company: loginInfo.company,
            employeeId: loginInfo.employeeId,
            name: user.name,
            department: user.department, // 부서명
            realAge: user.realAge,
            faceAge: randomFaceAge,
            ageDifference,
            completedAt,
          });

          // 응답 Content-Type 확인
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            const text = await response.text();
            console.error("❌ JSON이 아닌 응답 받음:", {
              contentType,
              status: response.status,
              statusText: response.statusText,
              body: text.substring(0, 200), // 처음 200자만
            });
            throw new Error(`서버가 JSON이 아닌 응답을 반환했습니다: ${response.status} ${response.statusText}`);
          }

          const result = await response.json();
          console.log("✅ 구글 시트 저장 성공:", result);
        } catch (error) {
          // 저장 실패해도 사용자에게는 오류 표시하지 않음 (백그라운드 작업)
          console.error("❌ 분석 결과 저장 실패:", error);
          if (error instanceof Error) {
            console.error("에러 상세:", error.message);
            console.error("에러 스택:", error.stack);
          }
        }
      } else {
        console.warn("⚠️ 사용자 정보 또는 로그인 정보가 없어 저장하지 않음");
      }
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
    setLoginInfo(null); // 로그인 정보도 초기화
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
