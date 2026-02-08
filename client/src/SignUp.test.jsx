import SignIn from "./SignIn.jsx";
import { render, screen, fireEvent, waitFor, findByText } from '@testing-library/react';
import { GoogleOAuthProvider } from '@react-oauth/google'
import SignUp from "./SignUp.jsx";

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
vi.mock("@react-oauth/google", async () => {
  const actual = await vi.importActual("@react-oauth/google");
  return {
    ...actual,
    GoogleLogin: ({ onSuccess }) => (
      <button onClick={() => {onSuccess({credential: "mock credential"})}}>mock google login</button>
    )
  } 
});
vi.mock("./auth/AuthProvider.jsx", () => ({
    useAuth: () => mockUseAuth(),
}));

const consoleMock = vi.spyOn(console, 'log').mockImplementation(() => undefined);

global.fetch = mockFetch;

describe('SignUp', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAuth.mockReturnValue({
            setUser: mockSetUser,
        });
    });

    test('user successfully create account', async () => {
        const return_value = {
            message: "account created"
        }
        mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => (return_value),
        });

        render(
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID} >
                <SignUp />
            </GoogleOAuthProvider>
        );

        const payload = {
            email: "valid email",
            username: "valid username",
            password: "valid password",
            confirmPassword: "valid confirm password",
        };

        const signUpButton = screen.getByRole('button', { name: /sign-up-button/i });
        const usernameTextField = screen.getByLabelText("username");
        const emailTextField = screen.getByLabelText("email");
        const passwordTextField = screen.getByLabelText("password");
        const confirmPasswordTextField = screen.getByLabelText("confirm password");
        fireEvent.change(usernameTextField, {target: {value: "valid username"}});
        fireEvent.change(emailTextField, {target: {value: "valid email"}});
        fireEvent.change(confirmPasswordTextField, {target: {value: "valid confirm password"}});
        fireEvent.change(passwordTextField, {target: {value: "valid password"}});

        fireEvent.click(signUpButton);

        await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
            "http://localhost:8000/accounts/sign-up",
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

        expect(consoleMock).toHaveBeenCalledWith({message: "account created"});
    });

    test("user successfully create account with google", async () => {
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

    test('show errors if invalid username, email, password, confirmPassword', async () => {
        const return_value = {
            username: ["username error"],
            email: ["email error"],
            password: ["password error"],
            confirmPassword: ["confirm password error"],
        }
        mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => (return_value),
        });

        render(
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID} >
                <SignUp />
            </GoogleOAuthProvider>
        );

        const payload = {
            email: "invalid email",
            username: "invalid username",
            password: "invalid password",
            confirmPassword: "invalid confirm password",
        };

        const signUpButton = screen.getByRole('button', { name: /sign-up-button/i });
        const usernameTextField = screen.getByLabelText("username");
        const emailTextField = screen.getByLabelText("email");
        const passwordTextField = screen.getByLabelText("password");
        const confirmPasswordTextField = screen.getByLabelText("confirm password");
        fireEvent.change(usernameTextField, {target: {value: "invalid username"}});
        fireEvent.change(emailTextField, {target: {value: "invalid email"}});
        fireEvent.change(confirmPasswordTextField, {target: {value: "invalid confirm password"}});
        fireEvent.change(passwordTextField, {target: {value: "invalid password"}});

        fireEvent.click(signUpButton);

        await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
            "http://localhost:8000/accounts/sign-up",
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
        const emailError = await screen.findByText("email error");
        const passwordError = await screen.findByText("password error");
        const confirmPasswordError = await screen.findByText("confirm password error");
        expect(usernameError).toBeInTheDocument();
        expect(emailError).toBeInTheDocument();
        expect(passwordError).toBeInTheDocument();
        expect(confirmPasswordError).toBeInTheDocument();
    });

    test('show "... is taken" if username and email is taken', async () => {
        const return_value = {
            username: ["username is taken"],
            email: ["email is taken"],
        }
        mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => (return_value),
        });

        render(
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID} >
                <SignUp />
            </GoogleOAuthProvider>
        );

        const payload = {
            email: "valid email",
            username: "valid username",
            password: "valid password",
            confirmPassword: "valid confirm password",
        };

        const signUpButton = screen.getByRole('button', { name: /sign-up-button/i });
        const usernameTextField = screen.getByLabelText("username");
        const emailTextField = screen.getByLabelText("email");
        const passwordTextField = screen.getByLabelText("password");
        const confirmPasswordTextField = screen.getByLabelText("confirm password");
        fireEvent.change(usernameTextField, {target: {value: "valid username"}});
        fireEvent.change(emailTextField, {target: {value: "valid email"}});
        fireEvent.change(confirmPasswordTextField, {target: {value: "valid confirm password"}});
        fireEvent.change(passwordTextField, {target: {value: "valid password"}});

        fireEvent.click(signUpButton);

        await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
            "http://localhost:8000/accounts/sign-up",
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

        const usernameError = await screen.findByText("username is taken");
        const emailError = await screen.findByText("email is taken");
        expect(usernameError).toBeInTheDocument();
        expect(emailError).toBeInTheDocument();
    });

    test('show "passwords do not match" if passwords are not the same', async () => {
        const return_value = {
            non_field_errors: ["Passwords do not match"]
        }
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => (return_value),
        });
    
        render(
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID} >
                <SignUp />
            </GoogleOAuthProvider>
        );
    
        const payload = {
            email: "valid email",
            username: "valid username",
            password: "invalid password",
            confirmPassword: "invalid confirm password",
        };
    
        const signUpButton = screen.getByRole('button', { name: /sign-up-button/i });
        const usernameTextField = screen.getByLabelText("username");
        const emailTextField = screen.getByLabelText("email");
        const passwordTextField = screen.getByLabelText("password");
        const confirmPasswordTextField = screen.getByLabelText("confirm password");
        fireEvent.change(usernameTextField, {target: {value: "valid username"}});
        fireEvent.change(emailTextField, {target: {value: "valid email"}});
        fireEvent.change(confirmPasswordTextField, {target: {value: "invalid confirm password"}});
        fireEvent.change(passwordTextField, {target: {value: "invalid password"}});
    
        fireEvent.click(signUpButton);
    
        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith(
            "http://localhost:8000/accounts/sign-up",
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
    
        const errors = await screen.findAllByText("Passwords do not match");
        expect(errors).toHaveLength(2);
    });
});