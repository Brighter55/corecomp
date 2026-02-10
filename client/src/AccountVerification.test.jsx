import AccountVerification from "./AccountVerification"
import { MemoryRouter } from "react-router-dom";
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockFetch = vi.fn();
const mockUseParams = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual("react-router-dom");
  return {...actual, useParams: () => mockUseParams()};
});

global.fetch = mockFetch;

describe('AccountVerification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('activate user account', async () => {
    mockUseParams.mockReturnValue({
      token: "valid token",
      user_id: "valid user_id",
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({message: "Account is now active and your trial starts now!"}),
    });

    render(
      <MemoryRouter>
        <AccountVerification />
      </MemoryRouter>
    );

    const payload = {token: "valid token", user_id: "valid user_id"}

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/accounts/verify-email",
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

    const message = await screen.findByText('Account is now active and your trial starts now!');
    expect(message).toBeInTheDocument();
  });

  test('resend button should appear if token is invalid or expired', async () => {
    mockUseParams.mockReturnValue({
      token: "invalid token",
      user_id: "valid user_id",
    });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({message: "Token is either invalid or expired"}),
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({message: "email has been resent"}),
    });

    render(
      <MemoryRouter>
        <AccountVerification />
      </MemoryRouter>
    );

    let payload = {token: "invalid token", user_id: "valid user_id"}

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/accounts/verify-email",
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

    const message = await screen.findByText('Token is either invalid or expired');
    const resendButton = await screen.findByText("Resend email");
    expect(message).toBeInTheDocument();
    expect(resendButton).toBeInTheDocument();

    payload = {user_id: "valid user_id"};
    fireEvent.click(resendButton);
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/accounts/resend-verify-email",
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

  });

  test("account already activated", async () => {
      mockUseParams.mockReturnValue({
        token: "valid token",
        user_id: "valid user_id",
      });

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({message: "the account is already activated"}),
      });

      render(
        <MemoryRouter>
          <AccountVerification />
        </MemoryRouter>
      );

      const payload = {token: "valid token", user_id: "valid user_id"}

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "http://localhost:8000/accounts/verify-email",
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

      const message = await screen.findByText('the account is already activated');
      await waitFor(() => {
        const resendButton = screen.queryByRole('button', { name: /Resend email/i });
        expect(resendButton).not.toBeInTheDocument();
      });
      expect(message).toBeInTheDocument();
  });

    test("user not found", async () => {
      mockUseParams.mockReturnValue({
        token: "valid token",
        user_id: "invalid user_id",
      });

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({message: "User doesn't exist"}),
      });

      render(
        <MemoryRouter>
          <AccountVerification />
        </MemoryRouter>
      );

      const payload = {token: "valid token", user_id: "invalid user_id"}

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "http://localhost:8000/accounts/verify-email",
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

      const message = await screen.findByText("User doesn't exist");
      await waitFor(() => {
        const resendButton = screen.queryByRole('button', { name: /Resend email/i });
        expect(resendButton).not.toBeInTheDocument();
      });
      expect(message).toBeInTheDocument();
  });
});