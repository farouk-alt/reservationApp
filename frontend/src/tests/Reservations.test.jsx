import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event"; // ✅ You need this import
import Reservations from "../components/employes/Reservations";
import axios from "../api/axios";
import { vi, describe, it, expect } from "vitest";
import "@testing-library/jest-dom"; // ✅ Import only once, no need to duplicate

// 🧩 Mock axios module
vi.mock("../api/axios", () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: { statut: "confirmée" } })),
  },
}));

describe("Reservations component", () => {
  it("renders the title", () => {
    render(<Reservations />);
    expect(screen.getByText("📅 Réservations")).toBeInTheDocument();
  });

  it("fetches and displays reservations", async () => {
    render(<Reservations />);
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/reservations");
    });
  });

  it("can create a reservation", async () => {
    render(<Reservations />);

    // Fill the form
    fireEvent.change(screen.getByPlaceholderText("ID Employé"), {
      target: { value: "1" },
    });
    fireEvent.change(screen.getByPlaceholderText("ID Salle"), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByPlaceholderText("Durée (h)"), {
      target: { value: "2" },
    });

    // Submit (✅ using userEvent ensures act() wrapping)
    await userEvent.click(screen.getByText("Ajouter"));

    // ✅ Wait for the axios.post mock call
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/reservations",
        expect.objectContaining({
          num_emp: "1",
          num_salle: "2",
          duree: "2",
        })
      );
    });
  });
});
