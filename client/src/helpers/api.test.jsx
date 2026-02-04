import { authenticatedClientWithRetry } from "./api.js"


const mockFetch = vi.fn();
const mockNavigate = vi.fn();
const mockSetSymbol = vi.fn();

global.fetch = mockFetch;
vi.mock("react-router-dom", async () => {
    const actual = await vi.importActual("react-router-dom");
    return {...actual, useNavigate: () => mockNavigate};
});

const payload = {test: "test"};

describe("authenticatedClientWithRetry", () => {
    
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("should return success with the correct symbol", async () => {
        const mockResponse = {message: "good"};

        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => mockResponse,
        });

        let isActive = true;

        const response = await authenticatedClientWithRetry("/test/server", payload, () => isActive, mockNavigate, mockSetSymbol);

        expect(mockFetch).toHaveBeenCalledWith(
            "http://localhost:8000/test/server",
            expect.objectContaining({
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            }),
        );
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({message: "good"});
    });

    test("should navigate to /account if 403", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 403,
        });

        let isActive = true;

        const response = await authenticatedClientWithRetry("/test/server", payload, () => isActive, mockNavigate, mockSetSymbol);

        expect(response.status).toBe(403);
        expect(mockNavigate).toHaveBeenCalledWith("/account");
    });

    test("should navigate to /sign-up if 401", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
        });

        let isActive = true;

        const response = await authenticatedClientWithRetry("/test/server", payload, () => isActive, mockNavigate, mockSetSymbol);

        expect(response.status).toBe(401);
        expect(mockNavigate).toHaveBeenCalledWith("/sign-up");
    });

    test("should setSymbol if 400", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
        });

        let isActive = true;

        const response = await authenticatedClientWithRetry("/test/server", payload, () => isActive, mockNavigate, mockSetSymbol);

        expect(response.status).toBe(400);
        expect(mockNavigate).not.toHaveBeenCalledWith();
        expect(mockSetSymbol).toHaveBeenCalledWith("");
    });

    test("should retry if 503", async () => {
        // fetch should fail 2 times and succeed on third
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 503,
            headers: new Headers({
                'Retry-After': '2000'
            }),
        });
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 503,
            headers: new Headers({
                'Retry-After': '2000'
            }),
        });
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
        });

        let isActive = true;

        const response = await authenticatedClientWithRetry("/test/server", payload, () => isActive, mockNavigate, mockSetSymbol);

        expect(response.status).toBe(200);
        expect(mockFetch).toHaveBeenCalledTimes(3);
    });
});