import { Spinner } from "react-bootstrap";

export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="text-center py-5" role="status" aria-live="polite">
      <Spinner animation="border" variant="primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
      <p className="mt-3">{message}</p>
    </div>
  );
}

