import CheckoutReturn from "./CheckoutReturn.jsx";
import { render, waitFor } from '@testing-library/react';

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

describe('CheckoutReturn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('redirect to /overview when the checkout is complete', async () => {
    mockUseParams.mockReturnValue({
      checkout_session_id: "valid session id"
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({status: "complete", payment_status: "paid"}),
    });

    render(
        <CheckoutReturn />
    );

    const payload = {
      sessionId: "valid session id",
    };

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/billings/session-status",
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

    expect(mockUseNavigate).toHaveBeenCalledWith("/overview");
  });

  test('redirect to /account when the checkout is open or expired', async () => {
    mockUseParams.mockReturnValue({
      checkout_session_id: "valid session id"
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({status: "open", payment_status: "unpaid"}),
    });

    render(
        <CheckoutReturn />
    );

    const payload = {
      sessionId: "valid session id",
    };

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/billings/session-status",
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

    expect(mockUseNavigate).toHaveBeenCalledWith("/account");
  });
});