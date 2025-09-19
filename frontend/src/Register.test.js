import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Register from "./Register";
import * as api from "./api"; // mock API

// Mock the register API
jest.mock("./api");

describe("Register Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders form inputs and button", () => {
    render(<Register />, { wrapper: MemoryRouter });
    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /register/i })).toBeInTheDocument();
  });

  test("updates input values", () => {
    render(<Register />, { wrapper: MemoryRouter });

    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "mypassword" },
    });

    expect(screen.getByPlaceholderText("Username").value).toBe("testuser");
    expect(screen.getByPlaceholderText("Email").value).toBe("test@test.com");
    expect(screen.getByPlaceholderText("Password").value).toBe("mypassword");
  });

  test("successful registration shows success message", async () => {
    api.register.mockResolvedValueOnce({ message: "Registration successful!" });

    render(<Register />, { wrapper: MemoryRouter });

    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "john" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "john@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/Registration successful!/i)
      ).toBeInTheDocument();
    });
  });

  test("failed registration shows error message", async () => {
    api.register.mockRejectedValueOnce(new Error("User already exists"));

    render(<Register />, { wrapper: MemoryRouter });

    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "john" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "john@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByText(/User already exists/i)).toBeInTheDocument();
    });
  });

  test("disables button while submitting", async () => {
    api.register.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ message: "ok" }), 1000))
    );

    render(<Register />, { wrapper: MemoryRouter });

    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "john" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "john@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /register/i }));

    // Check if button is disabled
    expect(screen.getByRole("button", { name: /register/i })).toBeDisabled();
  });
});
