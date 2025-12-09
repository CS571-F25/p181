import { Card, Form, Button, ListGroup } from "react-bootstrap";
import { useState, useEffect } from "react";

export default function CommentSection({ highlightId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Load comments from localStorage
    const savedComments = JSON.parse(
      localStorage.getItem(`comments-${highlightId}`) || "[]"
    );
    setComments(savedComments);
  }, [highlightId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim()) return;

    const comment = {
      id: Date.now(),
      author: authorName,
      text: newComment,
      date: new Date().toISOString(),
    };

    const updated = [...comments, comment];
    setComments(updated);
    localStorage.setItem(`comments-${highlightId}`, JSON.stringify(updated));
    setNewComment("");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="comment-section">
      {!isExpanded ? (
        <Button
          variant="outline-secondary"
          onClick={() => setIsExpanded(true)}
          className="w-100"
          style={{ borderRadius: "12px" }}
        >
          Show Comments ({comments.length})
        </Button>
      ) : (
        <Card>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <Card.Title as="h3" style={{ marginBottom: 0 }}>Fan Discussion</Card.Title>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setIsExpanded(false)}
                style={{ borderRadius: "8px" }}
              >
                Hide
              </Button>
            </div>
            
            <Form onSubmit={handleSubmit} className="mb-4">
              <Form.Group className="mb-3">
                <Form.Label htmlFor={`author-${highlightId}`}>Your Name</Form.Label>
                <Form.Control
                  id={`author-${highlightId}`}
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label htmlFor={`comment-${highlightId}`}>Add a Comment</Form.Label>
                <Form.Control
                  id={`comment-${highlightId}`}
                  as="textarea"
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  required
                />
              </Form.Group>
              <Button type="submit" variant="primary">
                Post Comment
              </Button>
            </Form>

            <ListGroup>
              {comments.length === 0 ? (
                <p className="text-muted" style={{ textAlign: "center", padding: "2rem" }}>
                  No comments yet. Be the first to comment!
                </p>
              ) : (
                comments.map((comment) => (
                  <ListGroup.Item key={comment.id}>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <strong style={{ color: "var(--text-heading)" }}>{comment.author}</strong>
                      <small className="text-muted">{formatDate(comment.date)}</small>
                    </div>
                    <p className="mb-0" style={{ color: "var(--text-secondary)" }}>{comment.text}</p>
                  </ListGroup.Item>
                ))
              )}
            </ListGroup>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}

