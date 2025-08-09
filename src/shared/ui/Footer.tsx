export function Footer() {
  return (
    <footer className="bg-white/10 backdrop-blur-xl border-t border-white/10
      py-4 mt-12">
      <div className="container mx-auto px-6 text-center text-sm text-white/80">
        © 2023 WebCompany. All rights reserved.
        <span className="mx-2">•</span>
        <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
        <span className="mx-2">•</span>
        <a href="/terms" className="hover:text-white transition-colors">Terms</a>
      </div>
    </footer>
  );
}
