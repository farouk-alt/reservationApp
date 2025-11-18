import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Reservations from "../components/employes/Reservations";
import axios from "../api/axios";
import { vi, describe, it, expect } from "vitest";
import "@testing-library/jest-dom";

// 🧩 Proper axios mock
vi.mock("../api/axios", () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: { statut: "confirmée" } })),
  },
}));

describe("Reservations component", () => {
  it("renders the title", () => {
    render(<Reservations />);
    expect(screen.getByText("📅 Mes Réservations")).toBeInTheDocument();
  });

  it("fetches reservations on mount", async () => {
    render(<Reservations />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/reservations");
    });
  });

  it("can create a reservation", async () => {
    render(<Reservations />);

    // Your component uses selects (NOT placeholders)
    const salleSelect = screen.getAllByRole("combobox")[1]; // second select
    const dureeSelect = screen.getAllByRole("combobox")[2]; // third select

    fireEvent.change(salleSelect, { target: { value: "2" } });
    fireEvent.change(dureeSelect, { target: { value: "2" } });

    // Click submit
    await userEvent.click(screen.getByText("Ajouter"));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });
  });
});
