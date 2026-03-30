//src/components/client/common/Footer.tsx
import { Link } from "react-router-dom";
import logoImg from "../../../assets/YDlogo.jpg";

const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/YoungDiamonddd",
  instagram: "https://www.instagram.com/youngdiamond.jewels/",
  tiktok: "https://www.tiktok.com/@youngdiamonddd",
} as const;

const AGENT_ROUTE = "/agent-request";
const SUPPORT_EMAIL = "youngdiamond.jewels@gmail.com";
const DESIGNER_EMAIL = "dnminh1401@gmail.com";

function buildGmailComposeLink(email: string) {
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
}

function SocialIconButton({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="
        group h-9 w-9 rounded-full
        border border-white/15
        bg-black/30
        flex items-center justify-center
        cursor-pointer
        transition
        hover:bg-white/10 hover:border-white/25
        active:scale-95
        focus:outline-none focus:ring-2 focus:ring-white/30
      "
      aria-label={label}
      title={label}>
      <span className="text-white/90 group-hover:text-white transition">
        {children}
      </span>
    </a>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();
  const brandStartYear = 2025;
  const copyrightYear =
    year > brandStartYear ? `${brandStartYear}–${year}` : `${brandStartYear}`;
  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="inline-flex flex-col items-center">
              <img
                src={logoImg}
                alt="Young Diamond"
                className="
        h-7 md:h-8 lg:h-9
        w-auto
        object-contain
        select-none
      "
                loading="eager"
                draggable={false}
              />

              <p
                className="
        mt-3
        text-[12px] md:text-[13px]
        tracking-[0.18em]
        uppercase
        text-neutral-400/90
        leading-relaxed
        text-center
      ">
                Dare to shine
              </p>
              <p
                className="
        mt-2
        text-[12px] md:text-[11px]
        tracking-[0.22em]
        uppercase
        text-neutral-500/80
        leading-relaxed
        text-center
      ">
                Best Choice For Playboy
              </p>

              <div className="mt-2 h-px w-10 bg-white/10" aria-hidden />
            </div>
          </div>

          <div>
            <div className="text-xs tracking-[0.2em] uppercase text-white font-semibold">
              Shop
            </div>
            <ul className="mt-4 space-y-2 text-sm text-neutral-400">
              <li>
                <Link to="/products" className="hover:text-white">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products?type=new" className="hover:text-white">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link to="/products?type=sales" className="hover:text-white">
                  Sales
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white">
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs tracking-[0.2em] uppercase text-white font-semibold">
              Support
            </div>
            <ul className="mt-4 space-y-2 text-sm text-neutral-400">
              <li>
                <Link to={AGENT_ROUTE} className="hover:text-white">
                  Đăng ký đại lý
                </Link>
              </li>
              <li>
                <a
                  // href={`mailto:${SUPPORT_EMAIL}`}
                  href={buildGmailComposeLink(SUPPORT_EMAIL)}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white transition"
                  aria-label="Email Young Diamond support">
                  Liên hệ: {SUPPORT_EMAIL}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs tracking-[0.2em] uppercase text-white font-semibold">
              Social
            </div>

            <div className="mt-4 flex items-center gap-2">
              <SocialIconButton href={SOCIAL_LINKS.facebook} label="Facebook">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M14 8.5V7.3c0-.8.5-1.3 1.4-1.3H17V3h-2.1C12.6 3 11 4.5 11 7.2v1.3H9v3h2V21h3v-9.5h2.5l.5-3H14Z"
                    fill="currentColor"
                  />
                </svg>
              </SocialIconButton>

              <SocialIconButton href={SOCIAL_LINKS.instagram} label="Instagram">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  />
                  <path
                    d="M17.4 6.6h.01"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                  />
                </svg>
              </SocialIconButton>

              <SocialIconButton href={SOCIAL_LINKS.tiktok} label="TikTok">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M14 3v11.2a3.6 3.6 0 1 1-3-3.54V7.6a7 7 0 1 0 6.5 6.98V8.2c1.2 1.1 2.8 1.8 4.5 1.9V6.9c-2.3-.2-4.2-1.8-5-3.9H14Z"
                    fill="currentColor"
                    opacity=".95"
                  />
                </svg>
              </SocialIconButton>
            </div>
          </div>
        </div>

        {/* Hàng 1: © + policy/terms */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-sm text-neutral-500">
            © {copyrightYear} Young Diamond. All rights reserved.
          </div>
          <div className="text-sm text-neutral-500 flex items-center gap-4"></div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-1 md:gap-3 text-xs text-neutral-600">
            <span>
              Designed by{" "}
              <span className="text-neutral-500 font-medium">Đỗ Nhật Minh</span>
            </span>
            <span className="hidden md:inline text-neutral-700/60">•</span>
            <a
              href={buildGmailComposeLink(DESIGNER_EMAIL)}
              target="_blank"
              rel="noreferrer"
              className="hover:text-white transition"
              aria-label="Contact designer">
              Contact: {DESIGNER_EMAIL}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
