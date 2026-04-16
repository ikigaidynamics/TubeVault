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
    <html lang="en" className="dark" style={{ overflowX: 'hidden', maxWidth: '100vw' }}>
      <body className={`${inter.className} ${alice.variable} antialiased`} style={{ overflowX: 'hidden', maxWidth: '100vw', position: 'relative' }} suppressHydrationWarning>
        {children}
        {/* TEMP DEBUG v2 — will be removed once confirmed fixed */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            if(window.innerWidth>640)return;
            var b=document.createElement('div');
            b.style.cssText='position:fixed;bottom:0;left:0;right:0;z-index:99999;background:#222;color:#0f0;font:bold 10px monospace;padding:6px;max-height:35vh;overflow:auto;border-top:2px solid #0f0;';
            b.textContent='Debug v2 loading...';
            document.body.appendChild(b);
            function chk(){
              var vw=document.documentElement.clientWidth;
              var dw=document.documentElement.scrollWidth;
              var bw=document.body.scrollWidth;
              var bad=[];
              document.querySelectorAll('*').forEach(function(el){
                var r=el.getBoundingClientRect();
                if(r.right>vw+2){
                  var tag=el.tagName.toLowerCase();
                  var cls=(el.className&&typeof el.className==='string')?'.'+el.className.split(' ').slice(0,4).join('.'):'';
                  bad.push(tag+cls+' right:'+Math.round(r.right)+' w:'+Math.round(r.width));
                }
              });
              var info='vw='+vw+' docSW='+dw+' bodySW='+bw;
              if(bad.length){
                b.style.borderColor='red';b.style.color='#f88';
                b.innerHTML='<b>OVERFLOW ('+bad.length+') '+info+'</b><br>'+bad.slice(0,15).join('<br>');
              }else{
                b.style.borderColor='#0f0';b.style.color='#0f0';
                b.textContent='OK no overflow | '+info;
              }
            }
            new MutationObserver(function(){setTimeout(chk,150)}).observe(document.body,{childList:true,subtree:true,attributes:true});
            setInterval(chk,3000);setTimeout(chk,500);setTimeout(chk,2000);
          })();
        `}} />
    </html>
  );
}
