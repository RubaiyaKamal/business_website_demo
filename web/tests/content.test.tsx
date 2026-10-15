import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RichText } from "@/components/content/RichText";

describe("RichText", () => {
  it("splits blank-line separated text into paragraphs", () => {
    render(<RichText text={"First paragraph.\n\nSecond paragraph."} />);
    expect(screen.getByText("First paragraph.")).toBeInTheDocument();
    expect(screen.getByText("Second paragraph.")).toBeInTheDocument();
  });

  it("renders bullet lists", () => {
    render(<RichText text={"Intro.\n\n- one\n- two"} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("renders numbered lists", () => {
    render(<RichText text={"1. first\n2. second"} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("renders headings and quotes", () => {
    render(<RichText text={"## Heading\n\n> A quote"} />);
    expect(screen.getByRole("heading", { level: 2, name: "Heading" })).toBeInTheDocument();
    expect(screen.getByText("A quote")).toBeInTheDocument();
  });
});
