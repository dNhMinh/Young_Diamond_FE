import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-black">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full border border-white/70 flex items-center justify-center">
                <span className="text-white font-bold">YD</span>
              </div>
              <div className="font-semibold tracking-wide text-white">
                Young Diamond
              </div>
            </div>
            <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
              Trang sức tối giản, cá tính, hiện đại.
            </p>

            <div className="mt-4 flex items-center gap-2">
              <a
                href="#"
                className="h-9 w-9 rounded-full border border-white/15 flex items-center justify-center hover:bg-white/5 text-white"
                aria-label="Facebook"
                title="Facebook"
              >
                f
              </a>
              <a
                href="#"
                className="h-9 w-9 rounded-full border border-white/15 flex items-center justify-center hover:bg-white/5 text-white"
                aria-label="Instagram"
                title="Instagram"
              >
                ig
              </a>
              <a
                href="#"
                className="h-9 w-9 rounded-full border border-white/15 flex items-center justify-center hover:bg-white/5 text-white"
                aria-label="TikTok"
                title="TikTok"
              >
                tt
              </a>
            </div>
          </div>

          {/* Shop */}
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

          {/* Support */}
          <div>
            <div className="text-xs tracking-[0.2em] uppercase text-white font-semibold">
              Support
            </div>
            <ul className="mt-4 space-y-2 text-sm text-neutral-400">
              <li>
                <Link to="/contact" className="hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/shipping" className="hover:text-white">
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link to="/policy" className="hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <div className="text-xs tracking-[0.2em] uppercase text-white font-semibold">
              Newsletter
            </div>
            <p className="mt-4 text-sm text-neutral-400">
              Nhận thông báo sản phẩm mới và ưu đãi.
            </p>
            <form
              className="mt-3 flex items-center gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                placeholder="Email..."
                className="
                  flex-1 h-10 px-4 rounded-full
                  border border-white/15 bg-black
                  outline-none text-sm text-white
                  placeholder:text-neutral-600
                "
              />
              <button className="h-10 px-5 rounded-full bg-white text-black text-sm hover:opacity-90">
                Join
              </button>
            </form>
            <p className="mt-2 text-xs text-neutral-500">
              * Tạm thời chưa gửi mail tự động.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-sm text-neutral-500">
            © {year} Young Diamond. All rights reserved.
          </div>
          <div className="text-sm text-neutral-500 flex items-center gap-4">
            <Link to="/policy" className="hover:text-white">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-white">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
