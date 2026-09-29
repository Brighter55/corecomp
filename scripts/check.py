#!/usr/bin/env python3
"""One command to run every CoreComp verification gate.

    python scripts/check.py              # everything
    python scripts/check.py --fast       # skip the slow frontend build
    python scripts/check.py --backend    # backend gates only
    python scripts/check.py --frontend   # frontend gates only
    python scripts/check.py --verbose    # stream full gate output

Every gate runs even when an earlier one fails, so a single pass gives the whole
picture instead of whack-a-mole.

CWD-independent: every path is derived from this file's location, so it behaves
identically from the repo root, from server/, and from client/.

The exit code is 0 only when every gate that ran passed. A gate that *could not*
run (Postgres or Redis down, ruff not installed) is reported separately, and an
environment problem makes the run INCOMPLETE -- which also exits 1. A broken
environment must never masquerade as green.
"""

from __future__ import annotations

import argparse
import os
import shutil
import socket
import subprocess
import sys
import time
from dataclasses import dataclass, field
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent.parent
SERVER = ROOT / "server"
DJANGO_DIR = SERVER / "corecomp"  # pytest.ini, conftest.py and manage.py live here
CLIENT = ROOT / "client"

TAIL_LINES = 40
PROD_API_HOST = "api.corecomp.cc"
CONNECT_TIMEOUT = 2.0
LOOPBACK = {"localhost", "127.0.0.1", "::1"}


# --------------------------------------------------------------------------- #
# Executable resolution
# --------------------------------------------------------------------------- #
def _windows_exe(argv: list[str]) -> list[str]:
    """CreateProcess cannot launch a .cmd/.bat directly, so route it via cmd.

    shutil.which("npm") returns ...\\npm.CMD on Windows; passing that straight
    to subprocess.run raises FileNotFoundError.
    """
    if os.name == "nt" and argv and argv[0].lower().endswith((".cmd", ".bat")):
        return ["cmd", "/c", *argv]
    return argv


def _pipenv_venv() -> Path | None:
    """Where pipenv keeps this project's virtualenv, or None."""
    pipenv = shutil.which("pipenv")
    if not pipenv or not (SERVER / "Pipfile").is_file():
        return None
    try:
        proc = subprocess.run(
            _windows_exe([pipenv, "--venv"]),
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            env={**os.environ, "PIPENV_PIPFILE": str(SERVER / "Pipfile")},
        )
    except OSError:
        return None
    if proc.returncode != 0:
        return None
    # pipenv prints "Loading .env environment variables..." ahead of the path,
    # so take the last line that actually names a directory.
    for line in reversed((proc.stdout or "").strip().splitlines()):
        candidate = Path(line.strip())
        if candidate.is_dir():
            return candidate
    return None


def python_cmd() -> list[str]:
    """The project interpreter, explicitly -- never an assumed active venv.

    Deliberately resolved to the venv's python *binary* rather than
    `pipenv run python`. pipenv loads server/.env and OVERRIDES the process
    environment with it, so `pipenv run` silently discards every variable
    build_env() sets -- MOCK, REDIS_CACHE_LOCATION, CSRF_TRUSTED_ORIGINS and
    the rest. That went unnoticed only because server/.env happens to hold
    usable values on a developer machine; on any other machine the contract
    would be void. Invoking the interpreter directly keeps the env intact.
    """
    override = os.environ.get("CORECOMP_PYTHON")
    if override:
        return _windows_exe([override])
    for rel in (
        ".venv/Scripts/python.exe",
        ".venv/bin/python",
        "venv/Scripts/python.exe",
        "venv/bin/python",
    ):
        candidate = SERVER / rel
        if candidate.exists():
            return [str(candidate)]
    venv = _pipenv_venv()
    if venv:
        for rel in ("Scripts/python.exe", "bin/python"):
            candidate = venv / rel
            if candidate.exists():
                return [str(candidate)]
    return [sys.executable]


def npm_cmd() -> list[str]:
    return _windows_exe([shutil.which("npm") or "npm"])


# --------------------------------------------------------------------------- #
# Environment
# --------------------------------------------------------------------------- #
def _read_dotenv(path: Path) -> dict[str, str]:
    """Minimal .env reader -- values only, used to discover the local DB target."""
    values: dict[str, str] = {}
    if not path.is_file():
        return values
    for raw in path.read_text(encoding="utf-8", errors="replace").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def _database_url(local: dict[str, str]) -> str | None:
    name = local.get("DATABASE_NAME")
    if not name:
        return None
    user = local.get("DATABASE_USER", "")
    password = local.get("DATABASE_PASSWORD", "")
    host = local.get("DATABASE_HOST", "localhost")
    port = local.get("DATABASE_PORT", "5432")
    auth = f"{user}:{password}@" if user else ""
    return f"postgresql://{auth}{host}:{port}/{name}"


def build_env() -> dict[str, str]:
    """Environment for every child process.

    settings.py calls load_dotenv(), which defaults to override=False -- so
    anything set here WINS over server/.env locally. In CI there is no .env at
    all (it is gitignored), so these values are the only source. That asymmetry
    is why every value the settings module reads without a default is set here
    rather than left to the repo's .env.
    """
    env = os.environ.copy()
    local = _read_dotenv(SERVER / ".env")

    env["DJANGO_SECRET_KEY"] = env.get("DJANGO_SECRET_KEY") or "verification-only-secret-key"

    # Deliberately does not blindly reuse an inherited DATABASE_URL -- a stray
    # shell export pointing at Render would otherwise aim the whole run at prod.
    database_url = (
        env.get("CORECOMP_TEST_DATABASE_URL")
        or _database_url(local)
        or "postgresql://postgres:postgres@localhost:5432/corecomp"
    )
    redis_url = (
        env.get("CORECOMP_TEST_REDIS_URL")
        or local.get("REDIS_CACHE_LOCATION")
        or "redis://localhost:6379/1"
    )
    env["DATABASE_URL"] = database_url
    env["REDIS_CACHE_LOCATION"] = redis_url

    # Vars settings.py reads with no usable default. CSRF_TRUSTED_ORIGINS in
    # particular is `[os.getenv(...)]` -- it does NOT filter empties the way
    # ALLOWED_HOSTS does, so leaving it unset yields the literal [None].
    env.setdefault("DEBUG", "False")
    env.setdefault("ALLOWED_HOSTS", "localhost,127.0.0.1,testserver")
    env.setdefault("CORS_ALLOWED_ORIGINS", "http://localhost:5173")
    env.setdefault("CSRF_TRUSTED_ORIGINS", "http://localhost:5173")
    env.setdefault("CSRF_COOKIE_SAMESITE", "Lax")
    env.setdefault("AUTH_COOKIE_SAMESITE", "Lax")
    env.setdefault("AUTH_COOKIE_SECURE", "False")
    env.setdefault("CSRF_COOKIE_SECURE", "False")
    env.setdefault("FRONTEND_BASE_URL", "http://localhost:5173")

    env["PYTHONIOENCODING"] = "utf-8"
    env["FORCE_COLOR"] = "0"
    env["NO_COLOR"] = "1"

    # Keep `pipenv run` CWD-independent.
    if (SERVER / "Pipfile").is_file():
        env.setdefault("PIPENV_PIPFILE", str(SERVER / "Pipfile"))

    # MOCK is intentionally NOT set. services/__init__.py reads it at import
    # time and pages/views/overview.py derives its cache namespace from it;
    # local dev runs live and the suite mocks requests, so setting it here would
    # only make verification diverge from the app it is verifying.

    # Hard guard: verification may only ever touch loopback.
    for label, url, override in (
        ("database", database_url, "CORECOMP_TEST_DATABASE_URL"),
        ("redis", redis_url, "CORECOMP_TEST_REDIS_URL"),
    ):
        host = urlsplit(url).hostname or "localhost"
        if host not in LOOPBACK:
            sys.exit(
                f"[check] refusing to run: the verification {label} URL targets "
                f"{host!r}, which is not loopback.\n"
                f"        Set {override} if this is genuinely intended."
            )
    return env


# --------------------------------------------------------------------------- #
# Gates
# --------------------------------------------------------------------------- #
@dataclass
class Gate:
    label: str
    argv: list[str]
    cwd: Path
    extra_env: dict[str, str] = field(default_factory=dict)
    skip_note: str | None = None  # set -> always SKIP, with this reason
    skip_soft: bool = True  # True: optional tool missing, does not fail the run.
    #                         False: the gate could not run -> run is INCOMPLETE.
    needs_infra: bool = False  # set -> skipped when Postgres/Redis are down


@dataclass
class Result:
    label: str
    status: str  # PASS | FAIL | SKIP
    seconds: float
    output: str = ""
    note: str = ""
    soft: bool = False  # a soft SKIP (missing optional tool) does not fail the run


def run_gate(gate: Gate, base_env: dict[str, str], verbose: bool) -> Result:
    if gate.skip_note:
        return Result(gate.label, "SKIP", 0.0, note=gate.skip_note, soft=gate.skip_soft)
    env = {**base_env, **gate.extra_env}
    start = time.perf_counter()
    try:
        proc = subprocess.run(
            gate.argv,
            cwd=str(gate.cwd),
            env=env,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
        output = (proc.stdout or "") + (proc.stderr or "")
        status = "PASS" if proc.returncode == 0 else "FAIL"
        if verbose:
            print(f"\n----- {gate.label} -----\n{output}", flush=True)
    except FileNotFoundError as exc:
        output, status = f"command not found: {exc}", "FAIL"
    return Result(gate.label, status, time.perf_counter() - start, output)


def probe(host: str, port: int) -> tuple[bool, str]:
    try:
        socket.create_connection((host, port), timeout=CONNECT_TIMEOUT).close()
        return True, ""
    except OSError as exc:
        return False, exc.__class__.__name__


def diagnose_infra(env: dict[str, str]) -> list[str]:
    problems: list[str] = []
    for label, url, default_port, hint in (
        (
            "PostgreSQL",
            env["DATABASE_URL"],
            5432,
            "Get-Service postgresql-x64-17  /  net start postgresql-x64-17",
        ),
        (
            "Redis",
            env["REDIS_CACHE_LOCATION"],
            6379,
            "docker compose up -d   (from server/)",
        ),
    ):
        parts = urlsplit(url)
        host = parts.hostname or "localhost"
        port = parts.port or default_port
        ok, err = probe(host, port)
        if not ok:
            problems.append(
                f"  - {label} at {host}:{port} is not accepting connections ({err})\n"
                f"      start it: {hint}"
            )
    return problems


def tool_available(py: list[str], module: str, env: dict[str, str]) -> bool:
    """Is `module` importable by the project interpreter?

    `env` MUST be the env from build_env(), not os.environ: without
    PIPENV_PIPFILE, `pipenv run` resolves against the *current directory* and
    silently picks a different virtualenv than the project's.
    """
    try:
        return (
            subprocess.run(
                py + ["-m", module, "--version"], capture_output=True, env=env
            ).returncode
            == 0
        )
    except OSError:
        return False


def scan_dist(dist: Path) -> Result:
    """Prove the freshly built bundle cannot reach the production API.

    vite build empties outDir first, so this only ever reads the fresh bundle.
    This is the enforceable half of the prod-URL guard; the process-env override
    passed to the build is the mechanism, but this survives Vite precedence
    changes, .env renames, and someone adding a new production URL.
    """
    start = time.perf_counter()
    dist = Path(dist).resolve()  # callers may pass a relative path
    if not dist.is_dir():
        return Result(
            "bundle has no prod API URL", "FAIL", 0.0, output=f"{dist} does not exist"
        )
    hits = []
    for asset in dist.rglob("*.js"):
        try:
            if PROD_API_HOST in asset.read_text(encoding="utf-8", errors="replace"):
                hits.append(str(asset.relative_to(ROOT)))
        except OSError:
            continue
    elapsed = time.perf_counter() - start
    if hits:
        return Result(
            "bundle has no prod API URL",
            "FAIL",
            elapsed,
            output=f"production API host found in: {', '.join(hits)}",
        )
    return Result(
        "bundle has no prod API URL",
        "PASS",
        elapsed,
        note="no production URL in dist",
    )


# --------------------------------------------------------------------------- #
# Main
# --------------------------------------------------------------------------- #
def main() -> int:
    parser = argparse.ArgumentParser(
        description="Run every CoreComp verification gate.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    scope = parser.add_mutually_exclusive_group()
    scope.add_argument("--backend", action="store_true", help="backend gates only")
    scope.add_argument("--frontend", action="store_true", help="frontend gates only")
    parser.add_argument("--fast", action="store_true", help="skip the slow frontend build")
    parser.add_argument("--verbose", action="store_true", help="print full gate output")
    args = parser.parse_args()

    run_backend = args.backend or not args.frontend
    run_frontend = args.frontend or not args.backend

    env = build_env()
    py, npm = python_cmd(), npm_cmd()

    db, rd = urlsplit(env["DATABASE_URL"]), urlsplit(env["REDIS_CACHE_LOCATION"])
    print(f"[check] python: {' '.join(py)}")
    print(f"[check] npm:    {' '.join(npm)}")
    print(f"[check] db:     {db.hostname}:{db.port or 5432}")
    print(f"[check] redis:  {rd.hostname}:{rd.port or 6379}", flush=True)

    gates: list[Gate] = []
    if run_backend:
        gates += [
            Gate("django check", py + ["manage.py", "check"], DJANGO_DIR),
            Gate(
                "migrations up to date",
                py + ["manage.py", "makemigrations", "--check", "--dry-run"],
                DJANGO_DIR,
            ),
            Gate("backend tests", py + ["-m", "pytest", "-q"], DJANGO_DIR, needs_infra=True),
            Gate(
                "backend lint (ruff)",
                py + ["-m", "ruff", "check", "."],
                SERVER,
                skip_note=(
                    None
                    if tool_available(py, "ruff", env)
                    else "ruff not installed (pipenv install --dev ruff)"
                ),
            ),
        ]
    if run_frontend:
        gates += [
            Gate("frontend lint", npm + ["run", "lint"], CLIENT),
            Gate("frontend tests", npm + ["run", "test:run"], CLIENT),
            Gate("typescript (tsc)", npm + ["run", "typecheck"], CLIENT),
        ]
        if not args.fast:
            # Vite gives pre-existing process env precedence over .env files, so
            # this override makes client/.env.production inert for the build.
            gates.append(
                Gate(
                    "frontend build",
                    npm + ["run", "build"],
                    CLIENT,
                    extra_env={"VITE_BACKEND_BASE_URL": "http://127.0.0.1:8000"},
                )
            )

    infra_note = ""
    if run_backend:
        problems = diagnose_infra(env)
        if problems:
            infra_note = "\n".join(problems)
            print("[check] backend services unavailable:", flush=True)
            print(infra_note, flush=True)
            for gate in gates:
                if gate.needs_infra:
                    gate.skip_note = "Postgres/Redis not reachable"
                    # NOT soft: the gate genuinely could not run, so the run is
                    # INCOMPLETE and must exit 1. Only an absent *optional* tool
                    # (ruff) is allowed to skip without failing the run.
                    gate.skip_soft = False

    results = [run_gate(g, env, args.verbose) for g in gates]

    build_result = next((r for r in results if r.label == "frontend build"), None)
    if build_result is not None and build_result.status == "PASS":
        results.append(scan_dist(CLIENT / "dist"))

    for r in results:
        if r.status == "FAIL":
            tail = "\n".join(r.output.splitlines()[-TAIL_LINES:])
            print(f"\n===== {r.label} (last {TAIL_LINES} lines) =====\n{tail}")

    total = sum(r.seconds for r in results)
    failed = [r for r in results if r.status == "FAIL"]
    incomplete = [r for r in results if r.status == "SKIP" and not r.soft]

    width = max((len(r.label) for r in results), default=10) + 2
    print("\n" + "=" * 68)
    print(" CoreComp verification summary")
    print("=" * 68)
    for r in results:
        print(f" {r.label:<{width}}{r.status:<7}{r.seconds:7.1f}s   {r.note}")
    print("-" * 68)
    print(f" {'TOTAL':<{width}}{'':<7}{total:7.1f}s")

    if failed:
        verdict = f"FAIL ({len(failed)} gate(s) failed)"
    elif incomplete:
        verdict = f"INCOMPLETE ({len(incomplete)} gate(s) could not run)"
    else:
        verdict = "PASS"
    print("=" * 68)
    print(f" RESULT: {verdict}")
    if infra_note:
        print(infra_note)
    print("=" * 68, flush=True)

    return 0 if not failed and not incomplete else 1


if __name__ == "__main__":
    raise SystemExit(main())
