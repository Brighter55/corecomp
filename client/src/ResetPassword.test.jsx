import ResetPassword from "./ResetPassword"
import { MemoryRouter } from "react-router-dom";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockFetch = vi.fn();

global.fetch = mockFetch;

describe('ResetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('display success text if email is correct', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({message: "success message"}),
    });

    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    const sendButton = screen.getByText("send");
    const emailTextField = screen.getByLabelText("email");
    fireEvent.change(emailTextField, {target: {value: "valid email"}});
    fireEvent.click(sendButton);

    const payload = {email: "valid email"};

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/accounts/reset-password",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }),
      );
    });

    const successMessage = await screen.findByText("Recovery email has been sent!");
    expect(successMessage).toBeInTheDocument();
  });

  test('display error text if email is not valid', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({email: "email error"}),
    });

    render(
      <MemoryRouter>
        <ResetPassword />
      </MemoryRouter>
    );

    const sendButton = screen.getByText("send");
    const emailTextField = screen.getByLabelText("email");
    fireEvent.change(emailTextField, {target: {value: "invalid email"}});
    fireEvent.click(sendButton);

    const payload = {email: "invalid email"};

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/accounts/reset-password",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }),
      );
    });

    await waitFor(() => {
        expect(screen.queryByText(/Recovery email has been sent!/i)).toBeNull();
    });
    const errorMessage = await screen.findByText("email error");
    expect(errorMessage).toBeInTheDocument();
  });
});