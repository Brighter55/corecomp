import ConfirmResetPassword from "./ConfirmResetPassword"
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockFetch = vi.fn();
const mockUseParams = vi.fn();
const mockUseNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => mockUseParams(),
    useNavigate: () => mockUseNavigate,
};
});

global.fetch = mockFetch;

describe('ConfirmResetPassword', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('reset password on valid password', async () => {
    mockUseParams.mockReturnValue({
      token: "valid token",
      id: "valid id",
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({message: "your password has been reset!"}),
    });

    render(
        <ConfirmResetPassword />
    );

    const passwordTextField = screen.getByLabelText('password');
    const confirmPasswordTextField = screen.getByLabelText('confirm-password');
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(passwordTextField, { target: { value: 'valid password' } });
    fireEvent.change(confirmPasswordTextField, { target: { value: 'valid confirm password' } });

    fireEvent.click(sendButton);

    const payload = {
      password: "valid password",
      confirmPassword: "valid confirm password",
      id: "valid id",
      token: "valid token",
    };

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/accounts/confirm-reset-password",
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

    expect(mockUseNavigate).toHaveBeenCalledWith("/sign-in");
  });

  test("password not valid", async () => {
    mockUseParams.mockReturnValue({
      token: "valid token",
      id: "valid id",
    });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({password: ["password error"]}),
    });

    render(
        <ConfirmResetPassword />
    );

    const sendButton = screen.getByRole('button', { name: /send/i });
    const passwordTextField = screen.getByLabelText('password');
    const confirmPasswordTextField = screen.getByLabelText('confirm-password');
    fireEvent.change(passwordTextField, { target: { value: 'invalid password' } });
    fireEvent.change(confirmPasswordTextField, { target: { value: 'invalid confirm password' } });

    fireEvent.click(sendButton);

    const payload = {
      password: "invalid password",
      confirmPassword: "invalid confirm password",
      id: "valid id",
      token: "valid token",
    };

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/accounts/confirm-reset-password",
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

    const errorText = await screen.findByText('password error');
    expect(errorText).toBeInTheDocument();
  });

  test("display id error if user_id is invalid", async () => {
    mockUseParams.mockReturnValue({
      token: "valid token",
      id: "invalid id",
    });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({id: ["id error"]}),
    });

    render(
        <ConfirmResetPassword />
    );

    const sendButton = screen.getByRole('button', { name: /send/i });
    const passwordTextField = screen.getByLabelText('password');
    const confirmPasswordTextField = screen.getByLabelText('confirm-password');
    fireEvent.change(passwordTextField, { target: { value: 'valid password' } });
    fireEvent.change(confirmPasswordTextField, { target: { value: 'valid confirm password' } });

    fireEvent.click(sendButton);

    const payload = {
      password: "valid password",
      confirmPassword: "valid confirm password",
      id: "invalid id",
      token: "valid token",
    };

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/accounts/confirm-reset-password",
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

    const errorText = await screen.findByText('id error');
    expect(errorText).toBeInTheDocument();
  });

  test("display token error if token is invalid", async () => {
    mockUseParams.mockReturnValue({
      token: "invalid token",
      id: "valid id",
    });

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({id: ["token error"]}),
    });

    render(
        <ConfirmResetPassword />
    );

    const sendButton = screen.getByRole('button', { name: /send/i });
    const passwordTextField = screen.getByLabelText('password');
    const confirmPasswordTextField = screen.getByLabelText('confirm-password');
    fireEvent.change(passwordTextField, { target: { value: 'valid password' } });
    fireEvent.change(confirmPasswordTextField, { target: { value: 'valid confirm password' } });

    fireEvent.click(sendButton);

    const payload = {
      password: "valid password",
      confirmPassword: "valid confirm password",
      id: "valid id",
      token: "invalid token",
    };

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/accounts/confirm-reset-password",
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

    const errorText = await screen.findByText('token error');
    expect(errorText).toBeInTheDocument();
  });
});