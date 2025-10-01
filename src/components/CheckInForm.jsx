import { useState } from "react";
import { Form, Button, Card } from "react-bootstrap";

function CheckInForm({ onSubmit }) {
  const [mood, setMood] = useState("😊");
  const [energy, setEnergy] = useState(5);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ mood, energy, notes, date: new Date().toISOString() });
    setNotes(""); // reset after submit
    setEnergy(5);
    setMood("😊");
  };

  return (
    <Card className="p-3 shadow-sm">
      <Card.Body>
        <Card.Title className="mb-3">Daily Wellness Check-In</Card.Title>
        <Form onSubmit={handleSubmit}>
          {/* Mood Selector */}
          <Form.Group className="mb-3">
            <Form.Label>How’s your mood today?</Form.Label>
            <Form.Select value={mood} onChange={(e) => setMood(e.target.value)}>
              <option value="😊">😊 Happy</option>
              <option value="😐">😐 Neutral</option>
              <option value="😔">😔 Sad</option>
              <option value="😡">😡 Stressed</option>
            </Form.Select>
          </Form.Group>

          {/* Energy Slider */}
          <Form.Group className="mb-3">
            <Form.Label>Energy Level: {energy}/10</Form.Label>
            <Form.Range
              min={1}
              max={10}
              value={energy}
              onChange={(e) => setEnergy(e.target.value)}
            />
          </Form.Group>

          {/* Notes */}
          <Form.Group className="mb-3">
            <Form.Label>Notes (optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything on your mind today?"
            />
          </Form.Group>

          <Button type="submit" variant="primary" className="w-100">
            Submit Check-In
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default CheckInForm;