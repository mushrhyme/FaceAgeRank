import LoginForm from "../LoginForm";

export default function LoginFormExample() {
  return (
    <LoginForm
      onSubmit={(company, employeeId) => {
        console.log("Login submitted:", { company, employeeId });
      }}
    />
  );
}
