import { useEffect, useRef } from "react";

interface MatrixBackgroundProps {
  color?: string; // 색상 (기본값: 민트색)
  opacity?: number; // 투명도 (기본값: 0.25)
  fontSize?: number; // 글자 크기 (기본값: 20)
  speed?: number; // 떨어지는 속도 (ms, 기본값: 80)
  density?: number; // 밀도 조절 (0-1, 기본값: 0.6) - 낮을수록 여유로움
}

/**
 * Matrix 효과 배경 컴포넌트
 * 참고: https://github.com/jcortesm5681/MatrixHTML
 */
export default function MatrixBackground({ 
  color = "#26bfa6", // 민트색 기본값
  opacity = 0.25,
  fontSize = 20, // 더 큰 글자로 여유롭게
  speed = 80, // 더 느리게 떨어짐
  density = 0.6 // 밀도 낮춰서 여유롭게
}: MatrixBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // AI 분석 느낌의 코드/데이터 텍스트 (한글 제거, 영문/숫자/특수문자만)
    const chars = "01agefacedetectanalyzeprocessresultscorepredictdataimagepixelRGBHSVLABneuralnetworkmodelaccuracyconfidenceprobabilitytensorflowpytorchonnxopencvcv2numpyarraymatrixvector0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ{}[]()<>/\\|&%$#@!~`^*-+=.,;:?";
    const charArray = chars.split("");

    // 열 개수와 위치 계산 함수
    let columns = 0;
    let columnWidth = 0;
    let drops: number[] = [];

    const calculateColumns = () => {
      const baseColumns = Math.floor(canvas.width / fontSize);
      columns = Math.floor(baseColumns * density); // 밀도에 따라 열 개수 조절
      columnWidth = canvas.width / columns; // 각 열의 너비 (균등 분배)
      
      // 각 열의 y 위치 배열 재생성
      drops = [];
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100; // 랜덤 시작 위치
      }
    };

    // 캔버스 크기 설정
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // 배경을 검은색으로 설정 (다크모드)
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      // 열 개수 재계산
      calculateColumns();
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // 색상 파싱 (hex to rgb)
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 38, g: 191, b: 166 }; // 기본 민트색
    };

    const rgb = hexToRgb(color);

    // 초기 배경을 검은색으로 설정 (다크모드)
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 애니메이션 함수
    const draw = () => {
      // 반투명 검은색으로 이전 프레임 지우기 (꼬리 효과 - 다크모드)
      ctx.fillStyle = `rgba(0, 0, 0, 0.05)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 각 열에 대해 문자 그리기 (민트색)
      ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        // 랜덤 문자 선택
        const text = charArray[Math.floor(Math.random() * charArray.length)];
        
        // 문자 그리기 (균등 분배된 x 위치)
        const x = i * columnWidth;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        // 아래로 이동
        drops[i]++;

        // 화면 밖으로 나가면 다시 위로 (재시작 확률 낮춤)
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.99) {
          drops[i] = 0;
        }
      }
    };

    // 애니메이션 시작
    const interval = setInterval(draw, speed); // 속도 조절 가능

    // 정리
    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [color, opacity, fontSize, speed, density]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

