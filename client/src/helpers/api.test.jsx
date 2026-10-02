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

    test("should not send X-CSRFToken when no csrftoken cookie exists", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ message: "good" }),
        });

        const response = await authenticatedClientWithRetry("/test/server", payload, () => true, mockNavigate, mockSetSymbol);

        expect(response.status).toBe(200);
        expect(mockFetch).toHaveBeenCalledWith(
            "http://localhost:8000/test/server",
            expect.objectContaining({
                method: "POST",
                headers: expect.not.objectContaining({ "X-CSRFToken": expect.any(String) }),
            }),
        );
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
                headers: expect.objectContaining({
                    "Content-Type": "application/json",
                    "X-Anonymous-Session": expect.any(String),
                }),
                credentials: "include",
                body: JSON.stringify(payload),
            }),
        );
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({message: "good"});
    });

    test("should navigate to /login if 403 with quota_exceeded", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 403,
            clone: () => ({
                json: async () => ({ detail: "quota_exceeded" }),
            }),
        });

        let isActive = true;

        const response = await authenticatedClientWithRetry("/test/server", payload, () => isActive, mockNavigate, mockSetSymbol);

        expect(response.status).toBe(403);
        expect(mockNavigate).toHaveBeenCalledWith("/login", {
            state: { message: "You've used all 5 free searches for this month. Sign in to continue." },
        });
    });

    test("should navigate to /login if 403 without quota detail", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 403,
        });

        let isActive = true;

        const response = await authenticatedClientWithRetry("/test/server", payload, () => isActive, mockNavigate, mockSetSymbol);

        expect(response.status).toBe(403);
        expect(mockNavigate).toHaveBeenCalledWith("/login");
    });

    test("should navigate to /login if 401", async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
        });

        let isActive = true;

        const response = await authenticatedClientWithRetry("/test/server", payload, () => isActive, mockNavigate, mockSetSymbol);

        expect(response.status).toBe(401);
        expect(mockNavigate).toHaveBeenCalledWith("/login");
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

    // A persistent 503 must not retry forever. Both tests below install a
    // safety valve that throws past a sane call count, so a regression shows up
    // as a fast, explicit failure rather than a hung run.
    function alwaysRespond503(retryAfter, valve = 20) {
        let calls = 0;
        mockFetch.mockImplementation(async () => {
            calls += 1;
            if (calls > valve) {
                throw new Error(`retried ${calls} times without settling`);
            }
            return {
                ok: false,
                status: 503,
                headers: new Headers(retryAfter === undefined ? {} : { "Retry-After": retryAfter }),
            };
        });
        return () => calls;
    }

    test("should give up after MAX_RETRIES when 503 persists", async () => {
        const calls = alwaysRespond503("10");

        const response = await authenticatedClientWithRetry("/test/server", payload, () => true, mockNavigate, mockSetSymbol);

        // 1 initial attempt + 2 retries, then it must return the 503 so callers
        // see a failure instead of waiting forever.
        expect(calls()).toBe(3);
        expect(response.status).toBe(503);
    });

    test("should not spin when Retry-After is not a number", async () => {
        // parseInt("soon") is NaN and setTimeout(NaN) fires immediately, so
        // without a finiteness guard this is a tight loop with no delay at all.
        const calls = alwaysRespond503("soon");

        const response = await authenticatedClientWithRetry("/test/server", payload, () => true, mockNavigate, mockSetSymbol);

        expect(calls()).toBe(1);
        expect(response.status).toBe(503);
    });

    test("should not retry when the caller is no longer active", async () => {
        const calls = alwaysRespond503("10");

        const response = await authenticatedClientWithRetry("/test/server", payload, () => false, mockNavigate, mockSetSymbol);

        expect(calls()).toBe(1);
        expect(response.status).toBe(503);
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
