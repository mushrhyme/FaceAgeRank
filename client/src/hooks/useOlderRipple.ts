import { useEffect } from "react";

/**
 * 노안 결과일 때 리플 효과를 표시하는 hook
 * @param isOlderLook 노안 여부
 */
export function useOlderRipple(isOlderLook: boolean) {
  useEffect(() => {
    if (!isOlderLook) return;

    // 캔버스 생성
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.pointerEvents = "none";
    canvas.style.zIndex = "9999";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d")!;
    
    let radius = 0;
    const maxRadius = 160;  
    const fadeStart = 70;   // 서서히 투명해지는 지점
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight * 0.35; // 동안 폭죽과 비슷한 위치

    // 폭죽과 유사한 파란색 계열 색상 (RGB 값)
    // '#3b82f6' -> rgb(59, 130, 246)
    // '#60a5fa' -> rgb(96, 165, 250)
    // '#93c5fd' -> rgb(147, 197, 253)
    // '#dbeafe' -> rgb(219, 234, 254)
    const blueColors = [
      { r: 59, g: 130, b: 246 },   // #3b82f6
      { r: 96, g: 165, b: 250 },   // #60a5fa
      { r: 147, g: 197, b: 253 },  // #93c5fd
      { r: 219, g: 234, b: 254 },  // #dbeafe
    ];

    // 랜덤 색상 선택
    const selectedColor = blueColors[Math.floor(Math.random() * blueColors.length)];

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 투명도 계산
      const opacity =
        radius < fadeStart
          ? 0.35
          : Math.max(0, 0.35 * (1 - (radius - fadeStart) / (maxRadius - fadeStart)));

      // 파동 그리기 - 파란색 계열 사용
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${selectedColor.r}, ${selectedColor.g}, ${selectedColor.b}, ${opacity})`;
      ctx.lineWidth = 4;
      ctx.stroke();

      radius += 3; // 퍼지는 속도

      if (radius < maxRadius) {
        requestAnimationFrame(draw);
      } else {
        document.body.removeChild(canvas);
      }
    }

    draw();

    // cleanup
    return () => {
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, [isOlderLook]);
}

