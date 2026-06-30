"use client";

import { useState } from "react";

export default function SocialShare({ title, url }) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ marginTop: 20 }}>
      <p style={{ color: "var(--muted)", fontSize: ".8rem", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1, fontWeight: 600 }}>Share on</p>
      <div className="share-wrap">
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="share-btn share-fb" title="Facebook">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
        </a>
        <a href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`} target="_blank" rel="noopener noreferrer" className="share-btn share-tw" title="Twitter / X">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
        </a>
        <a href={`https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`} target="_blank" rel="noopener noreferrer" className="share-btn share-rd" title="Reddit">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zm-1.89-6.39a1.6 1.6 0 0 1-2.22-.16l-.1-.13a1.6 1.6 0 0 1 2.32-2.15l1.62 1.76-1.62 1.76a1.6 1.6 0 0 1-.3.2zM12 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm3.89 4.61a1.6 1.6 0 0 1-2.32 2.15l-1.62-1.76 1.62-1.76a1.6 1.6 0 0 1 2.32 2.15l-.1.13a1.6 1.6 0 0 1-.3.2z"/></svg>
        </a>
        <a href={`https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`} target="_blank" rel="noopener noreferrer" className="share-btn share-pi" title="Pinterest">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.184 0 7.441 2.981 7.441 6.953 0 4.161-2.625 7.513-6.273 7.513-1.224 0-2.375-.636-2.766-1.385l-.754 2.874c-.273 1.042-1.016 2.343-1.515 3.136 1.25.381 2.578.586 3.962.586 6.621 0 11.988-5.367 11.988-11.987C24 5.367 18.638 0 12.017 0z"/></svg>
        </a>
        <a href={`https://api.whatsapp.com/send?text=${encodedTitle} - ${encodedUrl}`} target="_blank" rel="noopener noreferrer" className="share-btn share-wa" title="WhatsApp">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a5.8 5.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.015 22.01A9.97 9.97 0 0 1 6.94 20.67l-.36-.214-3.766.987.996-3.666-.235-.374A9.973 9.973 0 0 1 2.02 12.01 9.998 9.998 0 0 1 12.015 2 9.998 9.998 0 0 1 22.01 12.01a9.998 9.998 0 0 1-9.995 10zM12.015 0C5.39 0 0 5.39 0 12.015c0 2.106.551 4.157 1.597 5.96L.035 23.965l6.155-1.614A11.96 11.96 0 0 0 12.015 24c6.626 0 12.015-5.39 12.015-12.015S18.641 0 12.015 0z"/></svg>
        </a>
        <button onClick={handleCopy} className="share-btn share-cp" title="Copy Link (for Insta/TikTok)">
          {copied ? "✓" : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
        </button>
      </div>
    </div>
  );
}
