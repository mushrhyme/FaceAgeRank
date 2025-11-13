import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bot } from 'lucide-react';
import Footer from "@/components/Footer";
import EventHeader from "@/components/EventHeader";

interface LoginFormProps {
  onSubmit: (company: string, employeeId: string) => void;
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const [company, setCompany] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  
  const texts = [
    "지금 이 순간의 얼굴 나이, 과연 몇 살일까요?",
    "오늘의 얼굴 나이 랭킹! Top3까지 상품도 드려요!",
    "내가 동안일지 궁금하다면 바로 확인해보세요!",
    "생각보다 높게 나왔나요? 그냥 재미로 보는 결과니깐 걱정마세요!",
    "생각보다 어리게 나왔다면? 오늘 기분 좋은 날이네요!",
  ];
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  // 타이핑 효과 - 주기적으로 반복
  useEffect(() => {
    let currentIndex = 0;
    const currentText = texts[currentTextIndex];
    
    // 타이핑 시작
    setIsTyping(true);
    setDisplayedText("");
    currentIndex = 0;
    
    const typingInterval = setInterval(() => {
      if (currentIndex < currentText.length) {
        setDisplayedText(currentText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        // 타이핑 완료 후 3초 대기
        setIsTyping(false);
        clearInterval(typingInterval);
        
        setTimeout(() => {
          // 다음 텍스트로 이동
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }, 3000);
      }
    }, 90); // 90ms마다 한 글자씩

    return () => clearInterval(typingInterval);
  }, [currentTextIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (company && employeeId) {
      onSubmit(company, employeeId);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background relative">
      <EventHeader />
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
      <div className="w-full max-w-5xl">
        {/* 헤더 */}
        <div className="text-center mb-8 pt-4">
          <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-16 h-16 text-primary" />
          </div>
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className="text-6xl font-bold text-primary leading-none">[</span>
            <h1 className="text-6xl font-semibold">AI 얼굴 나이 측정</h1>
            <span className="text-6xl font-bold text-primary leading-none">]</span>
          </div>
          <p className="text-2xl text-muted-foreground mt-6 min-h-[2.5rem]">
            {displayedText}
            {isTyping && <span className="animate-pulse">|</span>}
          </p>
        </div>
        <div className="my-8" />
        {/* 폼 */}
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg border-2">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="company" className="text-xl font-medium">
                    회사명
                  </Label>
                  <Select value={company} onValueChange={setCompany} required>
                    <SelectTrigger
                      id="company"
                      className="h-16 text-xl"
                      data-testid="input-company"
                    >
                      <SelectValue placeholder="회사명을 선택하세요" />
                    </SelectTrigger>
                    <SelectContent className="text-xl">
                      <SelectItem value="농심" className="text-xl">농심</SelectItem>
                      <SelectItem value="율촌화학" className="text-xl">율촌화학</SelectItem>
                      <SelectItem value="메가마트" className="text-xl">메가마트</SelectItem>
                      <SelectItem value="농심태경" className="text-xl">농심태경</SelectItem>
                      <SelectItem value="농심엔지니어링" className="text-xl">농심엔지니어링</SelectItem>
                      <SelectItem value="엔디에스" className="text-xl">엔디에스</SelectItem>
                      <SelectItem value="호텔농심" className="text-xl">호텔농심</SelectItem>
                      <SelectItem value="농심캐피탈" className="text-xl">농심캐피탈</SelectItem>
                      <SelectItem value="농심미분" className="text-xl">농심미분</SelectItem>
                      <SelectItem value="농심홀딩스" className="text-xl">농심홀딩스</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employeeId" className="text-xl font-medium">
                    사번
                  </Label>
                  <Input
                    id="employeeId"
                    type="text"
                    placeholder="사번을 입력하세요"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="h-16 text-xl"
                    data-testid="input-employee-id"
                    required
                  />
                </div>
                <div className="pt-2 flex justify-center">
                  <Button
                    type="submit"
                    className="h-16 px-12 text-xl font-medium min-w-64"
                    data-testid="button-submit"
                  >
                    확인
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}
