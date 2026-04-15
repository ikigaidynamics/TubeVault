import type { Metadata } from "next";
import { Inter, Alice } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const alice = Alice({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-alice",
});

export const metadata: Metadata = {
  title: "TubeVault — AI-Powered YouTube Search",
  description:
    "Search YouTube channels by meaning. Ask questions, get answers from creator videos with exact timestamps.",
  icons: {
    icon: "/TubeVault_Logo_round.png",
    apple: "/TubeVault_Logo_round.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} ${alice.variable} antialiased`} suppressHydrationWarning>
        {children}
        {/* TEMPORARY DEBUG: finds the element causing horizontal overflow */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            if(window.innerWidth > 640) return; // only on mobile
            var banner = document.createElement('div');
            banner.id = '__dbg';
            banner.style.cssText = 'position:fixed;bottom:0;left:0;right:0;z-index:99999;background:red;color:white;font:bold 11px monospace;padding:8px;max-height:40vh;overflow:auto;';
            banner.textContent = 'Watching for overflow...';
            document.body.appendChild(banner);
            function check(){
              var vw = document.documentElement.clientWidth;
              var bad = [];
              document.querySelectorAll('*').forEach(function(el){
                var r = el.getBoundingClientRect();
                if(r.right > vw + 1){
                  var over = Math.round(r.right - vw);
                  var id = el.tagName.toLowerCase();
                  if(el.id) id += '#' + el.id;
                  if(el.className && typeof el.className === 'string') id += '.' + el.className.split(' ').slice(0,3).join('.');
                  bad.push(id + ' [right:' + Math.round(r.right) + ' over:' + over + 'px w:' + Math.round(r.width) + ']');
                }
              });
              if(bad.length){
                banner.style.background = 'red';
                banner.innerHTML = '<b>OVERFLOW (' + bad.length + ' els, vw=' + vw + '):</b><br>' + bad.join('<br>');
              } else {
                banner.style.background = 'green';
                banner.textContent = 'OK - no overflow (vw=' + vw + ')';
              }
            }
            // Check on mutation (content changes) and scroll
            var obs = new MutationObserver(function(){ setTimeout(check, 100); });
            obs.observe(document.body, {childList:true, subtree:true, attributes:true});
            window.addEventListener('scroll', function(){ setTimeout(check, 50); });
            setInterval(check, 2000);
            setTimeout(check, 1000);
          })();
        `}} />
      </body>
    </html>
  );
}
