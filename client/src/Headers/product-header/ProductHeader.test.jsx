import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductHeader from './ProductHeader';

const mockFetch = vi.fn();
const mockNavigate = vi.fn();
const mockUseAuth = vi.fn();
const mockSetUser = vi.fn();

global.fetch = mockFetch;

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

vi.mock("../../auth/AuthProvider.jsx", async () => {
  const actual = await vi.importActual("../../auth/AuthProvider.jsx");
  return {
    ...actual,
    useAuth: () => mockUseAuth()
  };
});



describe('ProductHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
      setUser: mockSetUser,
    });
  });

  test('sign out makes request to server when clicked', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
    });

    render(<ProductHeader />);
    
    const signOutButtons = screen.getAllByText(/sign out/i);
    fireEvent.click(signOutButtons[0]);

	await waitFor(() => {
		expect(mockFetch).toHaveBeenCalledWith(
			"http://localhost:8000/accounts/sign-out",
			expect.objectContaining({
				method: "GET",
				credentials: "include",
			}),
		);
	});

    expect(mockNavigate).toHaveBeenCalledWith("/sign-in");
    expect(mockSetUser).toHaveBeenCalledWith(null);

	fireEvent.click(signOutButtons[1]);

	await waitFor(() => {
		expect(mockFetch).toHaveBeenCalledWith(
			"http://localhost:8000/accounts/sign-out",
			expect.objectContaining({
				method: "GET",
				credentials: "include",
			}),
		);
	});

    expect(mockNavigate).toHaveBeenCalledWith("/sign-in");
    expect(mockSetUser).toHaveBeenCalledWith(null);
  });
});