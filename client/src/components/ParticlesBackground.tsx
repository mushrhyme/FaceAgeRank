import { useEffect, useRef } from "react";

// particles.js 타입 선언
declare global {
  interface Window {
    particlesJS: (id: string, config: object) => void;
    pJSDom?: Array<{ pJS: any }>;
  }
}

interface ParticlesBackgroundProps {
  className?: string; // 추가 스타일링을 위한 className
}

/**
 * particles.js를 React 컴포넌트로 래핑한 배경 파티클 컴포넌트
 * 배경 레이어로 사용되며, z-index를 통해 콘텐츠 뒤에 배치됨
 */
export default function ParticlesBackground({ className = "" }: ParticlesBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesLoadedRef = useRef(false);
  const timeoutRefsRef = useRef<NodeJS.Timeout[]>([]); // 모든 timeout 저장
  const intervalRefRef = useRef<NodeJS.Timeout | null>(null); // interval 저장
  const instanceIdRef = useRef<string | null>(null); // 고유 인스턴스 ID

  useEffect(() => {
    // 고유 인스턴스 ID 생성 (컴포넌트마다 다른 ID)
    if (!instanceIdRef.current) {
      instanceIdRef.current = `particles-js-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // id 설정
    if (containerRef.current && !containerRef.current.id) {
      containerRef.current.id = instanceIdRef.current;
    }

    // particles.js가 로드될 때까지 대기 후 초기화
    const initializeParticles = () => {
      if (!containerRef.current || typeof window.particlesJS !== "function") {
        return;
      }
      
      // id 확인
      if (!containerRef.current.id) {
        containerRef.current.id = instanceIdRef.current || `particles-js-${Date.now()}`;
      }
      
      console.log("Initializing particles.js...");
      
      // particles.js 설정 객체
      const config = {
        particles: {
          number: {
            value: 50, // 파티클 개수
            density: {
              enable: true,
              value_area: 800, // 파티클 밀도 영역
            },
          },
          color: {
            value: "#26bfa6", // 민트색 (메인 테마 색상)
          },
          shape: {
            type: "circle", // 원형 파티클
          },
          opacity: {
            value: 0.9, // 투명도 (더 진하게 보이도록 증가)
            random: true,
            anim: {
              enable: true,
              speed: 1,
              opacity_min: 0.5, // 최소 투명도도 높임
              sync: false,
            },
          },
          size: {
            value: 6, // 파티클 크기 (더 크게 - 4에서 6으로 증가)
            random: true,
            anim: {
              enable: true,
              speed: 2,
              size_min: 2, // 최소 크기도 증가
              sync: false,
            },
          },
          line_linked: {
            enable: true, // 파티클 간 연결선 활성화
            distance: 150, // 연결선 거리
            color: "#26bfa6", // 민트색
            opacity: 0.8, // 연결선 투명도 (더 진하게)
            width: 2.5, // 연결선 두께 (더 두껍게 - 1.5에서 2.5로 증가)
          },
          move: {
            enable: true,
            speed: 2, // 이동 속도
            direction: "none",
            random: false,
            straight: false,
            out_mode: "out", // 화면 밖으로 나가면 제거
            bounce: false,
          },
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: {
              enable: true,
              mode: "grab", // 마우스 호버 시 파티클 끌기
            },
            onclick: {
              enable: true,
              mode: "push", // 클릭 시 파티클 추가
            },
            resize: true,
          },
          modes: {
            grab: {
              distance: 140,
              line_linked: {
                opacity: 0.5,
              },
            },
            push: {
              particles_nb: 4,
            },
          },
        },
        retina_detect: true, // 고해상도 디스플레이 감지
      };

      // particles.js 초기화
      try {
        // 현재 인스턴스의 기존 canvas 제거
        if (containerRef.current) {
          const existingCanvas = containerRef.current.querySelector("canvas");
          if (existingCanvas && existingCanvas.parentNode) {
            existingCanvas.parentNode.removeChild(existingCanvas);
          }
        }
        
        // particles.js 초기화
        window.particlesJS(containerRef.current.id, config);
        console.log("particles.js initialized successfully for:", containerRef.current.id);
        particlesLoadedRef.current = true;
        
        // canvas가 제대로 생성되었는지 확인하고 z-index 설정
        setTimeout(() => {
          const canvas = containerRef.current?.querySelector("canvas");
          if (canvas) {
            console.log("particles.js canvas created:", canvas.width, "x", canvas.height);
            // canvas 스타일 강제 적용 (Matrix 위에 표시되도록)
            canvas.style.position = "absolute";
            canvas.style.top = "0";
            canvas.style.left = "0";
            canvas.style.width = "100%";
            canvas.style.height = "100%";
            canvas.style.zIndex = "1"; // Matrix(z-0) 위에 표시
          } else {
            console.warn("particles.js canvas not found after initialization");
          }
        }, 500);
      } catch (error) {
        console.error("Error initializing particles.js:", error);
        particlesLoadedRef.current = false;
      }
    };

    // particles.js가 이미 로드되어 있는지 확인
    if (typeof window !== "undefined" && typeof window.particlesJS === "function") {
      // 약간의 지연을 두고 초기화 (DOM이 완전히 준비될 때까지)
      const timeoutId = setTimeout(() => {
        initializeParticles();
      }, 100);
      timeoutRefsRef.current.push(timeoutId);
    } else {
      console.log("Waiting for particles.js to load...");
      // particles.js가 로드될 때까지 대기
      const checkParticles = setInterval(() => {
        if (typeof window !== "undefined" && typeof window.particlesJS === "function") {
          console.log("particles.js loaded, initializing...");
          if (intervalRefRef.current) {
            clearInterval(intervalRefRef.current);
            intervalRefRef.current = null;
          }
          const timeoutId = setTimeout(() => {
            initializeParticles();
          }, 300); // 100ms -> 300ms로 증가하여 DOM 준비 시간 확보
          timeoutRefsRef.current.push(timeoutId);
        }
      }, 50);
      intervalRefRef.current = checkParticles;

      // 최대 5초 대기 후 타임아웃
      const timeoutId = setTimeout(() => {
        if (intervalRefRef.current) {
          clearInterval(intervalRefRef.current);
          intervalRefRef.current = null;
        }
        if (!particlesLoadedRef.current) {
          console.warn("particles.js failed to load after 5 seconds");
          console.log("window.particlesJS:", window.particlesJS);
        }
      }, 5000);
      timeoutRefsRef.current.push(timeoutId);
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      // 모든 timeout 정리
      timeoutRefsRef.current.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      timeoutRefsRef.current = [];

      // interval 정리
      if (intervalRefRef.current) {
        clearInterval(intervalRefRef.current);
        intervalRefRef.current = null;
      }

      // particles.js 인스턴스 정리
      if (containerRef.current) {
        const canvas = containerRef.current.querySelector("canvas");
        if (canvas && canvas.parentNode) {
          canvas.parentNode.removeChild(canvas);
        }
      }
      
      // pJSDom에서 현재 인스턴스 제거
      if (window.pJSDom && window.pJSDom.length > 0) {
        window.pJSDom = window.pJSDom.filter((pJS) => {
          if (pJS.pJS && pJS.pJS.pJSDom && pJS.pJS.pJSDom[0]) {
            const pJSId = pJS.pJS.pJSDom[0].id;
            if (pJSId === instanceIdRef.current) {
              // 현재 인스턴스인 경우 제거
              if (pJS.pJS.fn && pJS.pJS.fn.vendors) {
                pJS.pJS.fn.vendors.destroypJS();
              }
              return false; // 필터에서 제외
            }
          }
          return true; // 다른 인스턴스는 유지
        });
      }

      particlesLoadedRef.current = false;
      instanceIdRef.current = null;
    };
  }, []);

  // 인스턴스 ID가 없으면 생성
  if (!instanceIdRef.current) {
    instanceIdRef.current = `particles-js-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  return (
    <div
      id={instanceIdRef.current}
      ref={containerRef}
      className={`fixed inset-0 ${className}`} // 배경 레이어로 설정
      style={{ 
        width: "100%", 
        height: "100%", 
        pointerEvents: "none",
        zIndex: 0 // MatrixBackground와 같은 레벨, 하지만 particles.js canvas가 위에 렌더링됨
      }} // pointerEvents로 클릭 이벤트가 뒤로 전달되도록
    />
  );
}

