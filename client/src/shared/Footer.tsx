import Brand from "./Brand.tsx";
import facebookLogo from "../assets/facebookLogo.png";
import tiktokLogo from "../assets/tiktokLogo.png";
import youtubeLogo from "../assets/youtubeLogo.png";

function Footer() {
  return (
    <footer className="space-y-6">
      <div className="h-px w-full bg-[var(--line-muted)]" />
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
        <Brand variant="landing" />
        <div className="flex flex-row gap-8">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Support</h3>
            <a className="text-[var(--text-muted)] hover:text-[var(--text-main)]" href="mailto:support@corecomp.cc">
              Contact Us
            </a>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Legal</h3>
            <div className="flex flex-col gap-1">
              <a className="text-[var(--text-muted)] hover:text-[var(--text-main)]" href="https://www.corecomp.cc/privacy-policy">
                Privacy Policy
              </a>
              <a className="text-[var(--text-muted)] hover:text-[var(--text-main)]" href="https://www.corecomp.cc/tos">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="h-px w-full bg-[var(--line-muted)]" />
      <div className="flex justify-center gap-3 pb-2">
        <a href="/" aria-label="facebook">
          <img src={facebookLogo} alt="facebook logo" className="h-8 w-8 rounded-full transition-transform hover:-translate-y-1" />
        </a>
        <a href="/" aria-label="tiktok">
          <img src={tiktokLogo} alt="tiktok logo" className="h-8 w-8 rounded-full transition-transform hover:-translate-y-1" />
        </a>
        <a href="/" aria-label="youtube">
          <img src={youtubeLogo} alt="youtube logo" className="h-8 w-8 rounded-full transition-transform hover:-translate-y-1" />
        </a>
      </div>
    </footer>
  );
}

export default Footer;
