#!/usr/bin/env python3
"""Generates on-brand SVG cover illustrations for HerbRx blog posts.
Line-art style consistent with the app's brand-icons.tsx glyphs —
no external assets, no licensing risk, renders instantly."""

import os

WRAP_OPEN = """<svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="{c1}"/>
      <stop offset="100%" stop-color="{c2}"/>
    </linearGradient>
    <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.4" fill="#ffffff" fill-opacity="0.16"/>
    </pattern>
  </defs>
  <rect width="800" height="450" fill="url(#g)"/>
  <rect width="800" height="450" fill="url(#dots)"/>
  <circle cx="670" cy="60" r="130" fill="#ffffff" fill-opacity="0.06"/>
  <circle cx="90" cy="410" r="170" fill="#ffffff" fill-opacity="0.05"/>
  <circle cx="400" cy="225" r="118" fill="#ffffff" fill-opacity="0.10"/>
"""
WRAP_CLOSE = "\n</svg>\n"

ICONS = {
    # 5 Common Herbal Products — cluster of leaves (safety/overview)
    "b1": """
  <g transform="translate(400,225)" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M0 55 C -55 55 -95 5 -95 -55 C -30 -55 0 -10 0 55 Z"/>
    <path d="M0 55 C 55 55 95 5 95 -55 C 30 -55 0 -10 0 55 Z"/>
    <path d="M0 55 L 0 -55" stroke-opacity="0.7"/>
    <path d="M0 65 C -38 65 -66 40 -70 0 C -25 0 0 25 0 65 Z" transform="translate(0,10) scale(0.62)"/>
    <path d="M0 65 C 38 65 66 40 70 0 C 25 0 0 25 0 65 Z" transform="translate(0,10) scale(0.62)"/>
    <line x1="-95" y1="88" x2="95" y2="88" stroke-opacity="0.55"/>
  </g>""",
    # How to Tell If a Herbal Product Is Safe — magnifier + check
    "b2": """
  <g transform="translate(400,225)" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="-18" cy="-18" r="62"/>
    <line x1="27" y1="27" x2="88" y2="88"/>
    <path d="M-48 -18 L-24 6 L14 -40" stroke-width="8"/>
  </g>""",
    # Moringa: Benefits, Risks — sprig with leaflets
    "b3": """
  <g transform="translate(400,225)" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M0 100 C -6 30 -6 -30 0 -100"/>
    <ellipse cx="-34" cy="-70" rx="20" ry="13" transform="rotate(-28 -34 -70)"/>
    <ellipse cx="34" cy="-70" rx="20" ry="13" transform="rotate(28 34 -70)"/>
    <ellipse cx="-46" cy="-28" rx="22" ry="14" transform="rotate(-24 -46 -28)"/>
    <ellipse cx="46" cy="-28" rx="22" ry="14" transform="rotate(24 46 -28)"/>
    <ellipse cx="-50" cy="18" rx="23" ry="15" transform="rotate(-18 -50 18)"/>
    <ellipse cx="50" cy="18" rx="23" ry="15" transform="rotate(18 50 18)"/>
    <ellipse cx="-40" cy="64" rx="22" ry="14" transform="rotate(-14 -40 64)"/>
    <ellipse cx="40" cy="64" rx="22" ry="14" transform="rotate(14 40 64)"/>
    <ellipse cx="0" cy="-104" rx="17" ry="12"/>
  </g""" + """>""",
    # NAFDAC registration guide for producers — clipboard with seal
    "b4": """
  <g transform="translate(400,225)" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <rect x="-58" y="-88" width="116" height="150" rx="14"/>
    <rect x="-26" y="-104" width="52" height="26" rx="8" fill="#ffffff" fill-opacity="0.18"/>
    <line x1="-32" y1="-38" x2="32" y2="-38" stroke-opacity="0.75"/>
    <line x1="-32" y1="-12" x2="32" y2="-12" stroke-opacity="0.75"/>
    <line x1="-32" y1="14" x2="10" y2="14" stroke-opacity="0.75"/>
    <circle cx="34" cy="70" r="34" fill="#ffffff" fill-opacity="0.12"/>
    <path d="M18 70 L30 82 L52 56" stroke-width="7"/>
  </g>""",
    # Bitter Leaf — single serrated leaf sprig
    "b5": """
  <g transform="translate(400,225)" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <path d="M0 -95 L0 95" stroke-opacity="0.75"/>
    <path d="M0 -90 C 55 -70 70 -20 70 0 C 70 20 55 70 0 90 C -55 70 -70 20 -70 0 C -70 -20 -55 -70 0 -90 Z"/>
    <path d="M0 -55 L26 -40 M0 -25 L34 -12 M0 5 L36 16 M0 35 L28 48" stroke-width="4" stroke-opacity="0.7"/>
    <path d="M0 -55 L-26 -40 M0 -25 L-34 -12 M0 5 L-36 16 M0 35 L-28 48" stroke-width="4" stroke-opacity="0.7"/>
  </g>""",
    # Zobo / Hibiscus — flower with petals
    "b6": """
  <g transform="translate(400,225)" fill="none" stroke="#ffffff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <g>
      <ellipse cx="0" cy="-58" rx="26" ry="42"/>
      <ellipse cx="0" cy="58" rx="26" ry="42"/>
      <ellipse cx="-58" cy="0" rx="42" ry="26"/>
      <ellipse cx="58" cy="0" rx="42" ry="26"/>
      <ellipse cx="-41" cy="-41" rx="26" ry="42" transform="rotate(45 -41 -41)"/>
      <ellipse cx="41" cy="-41" rx="26" ry="42" transform="rotate(-45 41 -41)"/>
      <ellipse cx="-41" cy="41" rx="26" ry="42" transform="rotate(-45 -41 41)"/>
      <ellipse cx="41" cy="41" rx="26" ry="42" transform="rotate(45 41 41)"/>
    </g>
    <circle cx="0" cy="0" r="20" fill="#ffffff" fill-opacity="0.35"/>
    <line x1="0" y1="24" x2="0" y2="120" stroke-opacity="0.7"/>
  </g>""",
}

POSTS = {
    "b1": ("#2D5A3D", "#4A7C59"),
    "b2": ("#B8832A", "#D4A85C"),
    "b3": ("#4A7C59", "#2D5A3D"),
    "b4": ("#C8DABB", "#4A7C59"),
    "b5": ("#C2DDD5", "#9BCABB"),
    "b6": ("#F5C4C4", "#E8A0A0"),
}

FILENAMES = {
    "b1": "5-common-herbal-products.svg",
    "b2": "how-to-tell-if-safe.svg",
    "b3": "moringa-benefits-risks.svg",
    "b4": "nafdac-registration-guide.svg",
    "b5": "bitter-leaf-ewuro.svg",
    "b6": "zobo-hibiscus.svg",
}

here = os.path.dirname(os.path.abspath(__file__))

for key, (c1, c2) in POSTS.items():
    svg = WRAP_OPEN.format(c1=c1, c2=c2) + ICONS[key] + WRAP_CLOSE
    out_path = os.path.join(here, FILENAMES[key])
    with open(out_path, "w") as f:
        f.write(svg)
    print("wrote", out_path)
