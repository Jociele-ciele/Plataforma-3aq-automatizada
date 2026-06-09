import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/interface/button";

describe("Button", () => {
  it("renderiza o texto", () => {
    render(<Button>Entrar</Button>);
    expect(screen.getByText("Entrar")).toBeInTheDocument();
  });

  it("aplica variante gradiente", () => {
    render(<Button variant="gradient">x</Button>);
    const el = screen.getByRole("button");
    expect(el.className).toContain("bg-gradient-to-r");
  });

  it("desabilita quando disabled=true", () => {
    render(<Button disabled>x</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
