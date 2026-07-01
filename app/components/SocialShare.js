"use client";

export default function SocialShare({ title, url }) {
  const shareLinks = [
    {
      name: "Facebook",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: "📘",
      color: "#1877F2"
    },
    {
      name: "Twitter",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      icon: "🐦",
      color: "#1DA1F2"
    },
    {
      name: "WhatsApp",
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + " " + url)}`,
      icon: "💬",
      color: "#25D366"
    },
    {
      name: "Telegram",
      url: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      icon: "✈️",
      color: "#0088CC"
    },
  ];

  return (
    <div style={{ marginTop: "16px", marginBottom: "16px" }}>
      <p style={{ color: "var(--muted, #aaa)", fontSize: "0.85rem", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
        Share this
      </p>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 12px",
              backgroundColor: "var(--card, #111)",
              border: "1px solid var(--border, #333)",
              borderRadius: "8px",
              textDecoration: "none",
              color: "white",
              fontSize: "0.9rem",
              transition: "transform 0.2s, background-color 0.2s"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = link.color;
              e.currentTarget.style.borderColor = link.color;
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "var(--card, #111)";
              e.currentTarget.style.borderColor = "var(--border, #333)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <span>{link.icon}</span>
            <span>{link.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
