import WebcamCapture from "../WebcamCapture";

export default function WebcamCaptureExample() {
  return (
    <WebcamCapture
      onCapture={(imageSrc) => {
        console.log("Image captured:", imageSrc.substring(0, 50) + "...");
      }}
      onBack={() => {
        console.log("Back button clicked");
      }}
    />
  );
}
