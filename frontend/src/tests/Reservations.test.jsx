import { render, screen, waitFor } from "@testing-library/react";
import Reservations from "../components/employes/Reservations";
import axios from "../api/axios";
import { vi, describe, it, beforeEach, expect } from "vitest";

vi.mock("../api/axios", () => ({
  default: {
    get: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

beforeEach(() => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() =>
    JSON.stringify({ id: 10 })
  );
});

describe("Reservations component", () => {
  it("renders the title", () => {
    render(<Reservations />);
    expect(screen.getByText("📅 Mes Réservations")).toBeInTheDocument();
  });

  it("fetches employee reservations on mount", async () => {
    render(<Reservations />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith("/reservations/employe/10");
    });
  });

  it("shows 'Aucune réservation trouvée' when list empty", async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<Reservations />);

    await screen.findByText("Aucune réservation trouvée.");
  });
});
