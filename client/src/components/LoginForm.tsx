import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bot } from 'lucide-react';

interface LoginFormProps {
  onSubmit: (company: string, employeeId: string) => void;
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const [company, setCompany] = useState("");
  const [employeeId, setEmployeeId] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (company && employeeId) {
      onSubmit(company, employeeId);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center p-8 bg-background">
      <div className="w-full max-w-6xl">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="mx-auto w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-20 h-20 text-primary" />
          </div>
          <h1 className="text-7xl font-semibold mt-12">AI가 본 내 얼굴 나이</h1>
          <p className="text-3xl text-muted-foreground mt-8">
            현실이랑 얼마나 다를까? 동안인지 노안인지 확인해보세요!
          </p>
        </div>
        <div className="my-20" />
        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
          <div className="space-y-3">
            <Label htmlFor="company" className="text-2xl font-medium">
              회사명
            </Label>
            <Select value={company} onValueChange={setCompany} required>
              <SelectTrigger
                id="company"
                className="h-20 text-2xl"
                data-testid="input-company"
              >
                <SelectValue placeholder="회사명을 선택하세요" />
              </SelectTrigger>
              <SelectContent className="text-2xl">
                <SelectItem value="농심" className="text-2xl">농심</SelectItem>
                <SelectItem value="율촌화학" className="text-2xl">율촌화학</SelectItem>
                <SelectItem value="메가마트" className="text-2xl">메가마트</SelectItem>
                <SelectItem value="농심태경" className="text-2xl">농심태경</SelectItem>
                <SelectItem value="농심엔지니어링" className="text-2xl">농심엔지니어링</SelectItem>
                <SelectItem value="엔디에스" className="text-2xl">엔디에스</SelectItem>
                <SelectItem value="호텔농심" className="text-2xl">호텔농심</SelectItem>
                <SelectItem value="농심캐피탈" className="text-2xl">농심캐피탈</SelectItem>
                <SelectItem value="농심미분" className="text-2xl">농심미분</SelectItem>
                <SelectItem value="농심홀딩스" className="text-2xl">농심홀딩스</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-3">
            <Label htmlFor="employeeId" className="text-2xl font-medium">
              사번
            </Label>
            <Input
              id="employeeId"
              type="text"
              placeholder="사번을 입력하세요"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="h-20 text-2xl"
              data-testid="input-employee-id"
              required
            />
          </div>
          <div className="pt-4 flex justify-center">
            <Button
              type="submit"
              className="h-20 px-16 text-2xl font-medium min-w-80"
              data-testid="button-submit"
            >
              확인
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
