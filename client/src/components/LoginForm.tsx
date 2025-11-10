import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
            <Input
              id="company"
              type="text"
              placeholder="회사명을 입력하세요"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="h-20 text-2xl"
              data-testid="input-company"
              required
            />
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
          <div className="pt-4">
            <Button
              type="submit"
              className="w-full h-16 text-xl font-medium"
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
