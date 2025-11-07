import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2 pb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Camera className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-semibold">얼굴 나이 측정</CardTitle>
          <CardDescription className="text-base">
            회사명과 사번을 입력하여 시작하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="company" className="text-sm font-medium">
                회사명
              </Label>
              <Input
                id="company"
                type="text"
                placeholder="회사명을 입력하세요"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="h-12"
                data-testid="input-company"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employeeId" className="text-sm font-medium">
                사번
              </Label>
              <Input
                id="employeeId"
                type="text"
                placeholder="사번을 입력하세요"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="h-12"
                data-testid="input-employee-id"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-base font-medium"
              data-testid="button-submit"
            >
              확인
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
