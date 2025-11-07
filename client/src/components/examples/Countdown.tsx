import Countdown from "../Countdown";

export default function CountdownExample() {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="p-8 text-center">
        <p className="text-muted-foreground">카운트다운 미리보기</p>
      </div>
      <Countdown
        onComplete={() => {
          console.log("Countdown completed!");
        }}
      />
    </div>
  );
}
