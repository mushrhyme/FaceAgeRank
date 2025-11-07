import ResultDisplay from "../ResultDisplay";

export default function ResultDisplayExample() {
  return (
    <ResultDisplay
      realAge={30}
      faceAge={20}
      name="조유민"
      onRetry={() => {
        console.log("Retry clicked");
      }}
      onReset={() => {
        console.log("Reset clicked");
      }}
    />
  );
}
