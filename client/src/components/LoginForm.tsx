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
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-6xl">
        <Card className="shadow-xl">
          <CardHeader className="text-center space-y-4 pb-12 pt-12">
            <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Camera className="w-12 h-12 text-primary" />
            </div>
            <CardTitle className="text-4xl font-semibold">얼굴 나이 측정</CardTitle>
            <CardDescription className="text-xl">
              회사명과 사번을 입력하여 시작하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="px-16 pb-16">
            <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl mx-auto">
              <div className="space-y-3">
                <Label htmlFor="company" className="text-lg font-medium">
                  회사명
                </Label>
                <Input
                  id="company"
                  type="text"
                  placeholder="회사명을 입력하세요"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="h-16 text-lg"
                  data-testid="input-company"
                  required
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="employeeId" className="text-lg font-medium">
                  사번
                </Label>
                <Input
                  id="employeeId"
                  type="text"
                  placeholder="사번을 입력하세요"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="h-16 text-lg"
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
