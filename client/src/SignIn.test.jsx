import SignIn from "./SignIn.jsx";
import { render, screen, fireEvent, waitFor, findByText } from '@testing-library/react';
import { GoogleOAuthProvider } from '@react-oauth/google'

const mockFetch = vi.fn();
const mockUseNavigate = vi.fn();
const mockUseAuth = vi.fn();
const mockSetUser = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => mockUseParams(),
    useNavigate: () => mockUseNavigate,
};
});
vi.mock("./auth/AuthProvider.jsx", async () => {
  const actual = await vi.importActual("./auth/AuthProvider.jsx");
  return {
    ...actual,
    useAuth: () => mockUseAuth()
  };
})
vi.mock("@react-oauth/google", async () => {
  const actual = await vi.importActual("@react-oauth/google");
  return {
    ...actual,
    GoogleLogin: ({ onSuccess }) => (
      <button onClick={() => {onSuccess({credential: "mock credential"})}}>mock google login</button>
    )
  } 
});

global.fetch = mockFetch;

describe('SignIn', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAuth.mockReturnValue({
        setUser: mockSetUser,
    });
  });

  test('redirect to /overview and update user when user successfully logs in', async () => {
    const return_value = {
        username: "valid username",
        email: "valid email",
        subscription_status: "valid subscription status",
        current_period_end: "valid period end",
        current_period_start: "valid period start",
    }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => (return_value),
    });

    render(
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID} >
            <SignIn />
        </GoogleOAuthProvider>
    );

    const signInButton = screen.getByRole('button', { name: /sign in button/i });
    const usernameTextField = screen.getByLabelText("username");
    const passwordTextField = screen.getByLabelText("password");
    fireEvent.change(usernameTextField, {target: {value: "valid username"}});
    fireEvent.change(passwordTextField, {target: {value: "valid password"}});

    fireEvent.click(signInButton);
    
    const payload = {
      username: "valid username",
      password: "valid password",
    };

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/accounts/sign-in",
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
    expect(mockSetUser).toHaveBeenCalledWith(return_value);
  });

  test("redirect to /overview and update user when user successfully logs in with google", async () => {
    const return_value = {
      username: "valid username",
      email: "valid email",
      subscription_status: "valid subscription status",
      current_period_end: "valid period end",
      current_period_start: "valid period start",
    }
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => (return_value),
    });

    render(
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID} >
            <SignIn />
        </GoogleOAuthProvider>
    );
    const mockGoogleLoginButton = await screen.findByText("mock google login");
    fireEvent.click(mockGoogleLoginButton);

    const payload = {JWTToken: "mock credential"};

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/accounts/google-authentication",
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
    expect(mockSetUser).toHaveBeenCalledWith(return_value);
  });

  test('display username error when the username is invalid', async () => {
    const return_value = {
      username: ["username error"],
    }
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => (return_value),
    });

    render(
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID} >
            <SignIn />
        </GoogleOAuthProvider>
    );

    const signInButton = screen.getByRole('button', { name: /sign in button/i });
    const usernameTextField = screen.getByLabelText("username");
    const passwordTextField = screen.getByLabelText("password");
    fireEvent.change(usernameTextField, {target: {value: "invalid username"}});
    fireEvent.change(passwordTextField, {target: {value: "valid password"}});

    fireEvent.click(signInButton);
    
    const payload = {
      username: "invalid username",
      password: "valid password",
    };

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/accounts/sign-in",
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

    const usernameError = await screen.findByText("username error");
    expect(usernameError).toBeInTheDocument();
    expect(mockUseNavigate).not.toHaveBeenCalledWith("/overview");
    expect(mockSetUser).not.toHaveBeenCalledWith(return_value);
  });

  test('display password error when the password is invalid', async () => {
    const return_value = {
      username: ["password error"],
    }
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => (return_value),
    });

    render(
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID} >
            <SignIn />
        </GoogleOAuthProvider>
    );

    const signInButton = screen.getByRole('button', { name: /sign in button/i });
    const usernameTextField = screen.getByLabelText("username");
    const passwordTextField = screen.getByLabelText("password");
    fireEvent.change(usernameTextField, {target: {value: "valid username"}});
    fireEvent.change(passwordTextField, {target: {value: "invalid password"}});

    fireEvent.click(signInButton);
    
    const payload = {
      username: "valid username",
      password: "invalid password",
    };

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/accounts/sign-in",
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
    const passwordError = await screen.findByText("password error");
    expect(passwordError).toBeInTheDocument();
    const usernameError = screen.queryByText("username error");
    expect(usernameError).not.toBeInTheDocument();
    expect(mockUseNavigate).not.toHaveBeenCalledWith("/overview");
    expect(mockSetUser).not.toHaveBeenCalledWith(return_value);
  });

  test('display error when the password/username is invalid', async () => {
    const return_value = {
      detail: "detail error"
    }
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => (return_value),
    });

    render(
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID} >
            <SignIn />
        </GoogleOAuthProvider>
    );

    const signInButton = screen.getByRole('button', { name: /sign in button/i });
    const usernameTextField = screen.getByLabelText("username");
    const passwordTextField = screen.getByLabelText("password");
    fireEvent.change(usernameTextField, {target: {value: "valid username"}});
    fireEvent.change(passwordTextField, {target: {value: "invalid password"}});

    fireEvent.click(signInButton);
    
    const payload = {
      username: "valid username",
      password: "invalid password",
    };

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/accounts/sign-in",
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
    const detailErrors = await screen.findAllByText("detail error");
    expect(detailErrors[0]).toBeInTheDocument();
    expect(detailErrors[1]).toBeInTheDocument();
    expect(mockUseNavigate).not.toHaveBeenCalledWith("/overview");
    expect(mockSetUser).not.toHaveBeenCalledWith(return_value);
  });

  test("resend email popup is shown if user logs in into inactive account", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({detail: "This account is inactive"}),
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({message: "email has been sent"}),
    });

    render(
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID} >
            <SignIn />
        </GoogleOAuthProvider>
    );

    const signInButton = screen.getByRole('button', { name: /sign in button/i });
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/accounts/sign-in",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({username: "", password: ""}),
        }),
      );
    });

    const popUpText = await screen.findByText(/Your account is not yet activated/i);
    expect(popUpText).toBeInTheDocument();
    const resendButton = screen.getByRole("button", { name: /resend-email-button/i });
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
          body: JSON.stringify({username: ""}),
        }),
      );
    });
  });
});