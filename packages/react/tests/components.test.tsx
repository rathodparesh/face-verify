import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FaceCapture, FaceGuide, JsonViewer, VerificationResult } from "../src";
describe("React components", () => {
  it("renders accessible upload", () => { render(<FaceCapture allowCamera={false} />); expect(screen.getByLabelText("Upload face image")).toBeInTheDocument(); });
  it("shows face guide text", () => { render(<FaceGuide status="too_far" />); expect(screen.getByText("Move closer to the camera.")).toBeInTheDocument(); });
  it.each([["match", "Match"], ["no_match", "No match"]] as const)("shows %s result", (decision, label) => {
    render(<VerificationResult result={{ schema_version:"1.0.0",operation:"face_verification",status:"success",verified:decision==="match",decision,similarity:{metric:"cosine_similarity",score:.8,threshold:.72},reference:{embedding_dimensions:2,embedding_normalized:true},probe:{face_detected:true,face_count:1,embedding_dimensions:2,embedding_normalized:true},quality:{score:1,acceptable:true,issues:[]},liveness:{performed:false,status:"not_checked"},processing:{mode:"browser",backend:"wasm",duration_ms:1},privacy:{image_uploaded:false,processed_locally:true},created_at:"2026-01-01T00:00:00Z"}} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
  it("provides JSON controls", () => { Object.defineProperty(navigator, "clipboard", { value: { writeText: vi.fn() }, configurable: true }); render(<JsonViewer value={{ embedding:{vector:[1,2]} }} />); expect(screen.getByLabelText("Copy JSON")).toBeInTheDocument(); expect(screen.getByLabelText("Download JSON")).toBeInTheDocument(); fireEvent.click(screen.getByText("Collapse JSON")); expect(screen.queryByText(/hidden 2 values/)).not.toBeInTheDocument(); });
});
