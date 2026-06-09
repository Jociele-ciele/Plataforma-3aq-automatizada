import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo } from "@/components/Logo";

describe("Logo", () => {
  it("mostra a marca", () => {
    render(<Logo />);
    expect(screen.getByText(/Talent/)).toBeInTheDocument();
  });
});
