import ResultDisplay from "../ResultDisplay";

export default function ResultDisplayExample() {
  return (
    <ResultDisplay
      age={28}
      company="테크 컴퍼니"
      employeeId="EMP-12345"
      onNewAttempt={() => {
        console.log("New attempt clicked");
      }}
    />
  );
}
