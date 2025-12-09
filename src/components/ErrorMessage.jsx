import { Alert } from "react-bootstrap";

export default function ErrorMessage({ message = "An error occurred. Please try again later." }) {
  return (
    <Alert variant="danger" role="alert">
      <Alert.Heading>Error</Alert.Heading>
      <p>{message}</p>
    </Alert>
  );
}

