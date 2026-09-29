# Blush Stone — Haute Joaillerie (Est. 2026)

A modern, luxury multi-page e-commerce website for **Blush Stone** jewelry, meticulously crafted with creamy warm beige and deep metallic bronze/gold aesthetics, custom brand logo integration, and real product catalog showcases.

---

## ✨ Design & Aesthetic Highlights

- **Color Palette**:
  - Creamy Warm Beige Background: `#FBF9F5` / `#FAF7F2`
  - Metallic Bronze & Gold Typography: `#8C6D3B`, `#7D5B28`, `#C5A059`
  - Deep Charcoal Warm Black: `#241F1A`
  - Starburst & Sparkle Accents: `✦` and delicate celestial motifs matching the logo.
- **Typography**:
  - Headings & Editorial Titles: *Cormorant Garamond* (Elegant luxury serif with custom italic calligraphy matching the "Blush Stone +" logo).
  - Body Text & Specifications: *Plus Jakarta Sans* (Clean, modern geometric sans-serif for optimal legibility).
- **Vibe**:
  - Minimalist high-end restraint, generous whitespace, calm luxury, and tactile warmth.

---

## 📁 Project Structure

```text
Blush Stone/
├── package.json               # Node.js dependencies (express, cors, morgan)
├── server.js                  # Express backend serving static pages & REST API
├── README.md                  # Project documentation
├── src/
│   └── data/
│       └── products.json      # Structured jewelry catalog data & specifications
└── public/
    ├── index.html             # Homepage: Hero, categories, featured grid, editorial story
    ├── shop.html              # Catalog: Filter by category (Rings, Necklaces, etc.), sorting
    ├── product.html           # Detail: Multi-image gallery, material swatches, size & qty
    ├── about.html             # Brand Story: Atelier heritage, 2026 founding, conscious luxury
    ├── contact.html           # Concierge: Private showroom salon, inquiries & FAQ
    ├── css/
    │   └── style.css          # Tailored luxury styling, starburst twinkles, animations
    ├── js/
    │   └── main.js            # Cart drawer, wishlist, search modal, checkout & toasts
    └── images/
        ├── logo.jpg                   # Custom "Blush Stone +" Est. 2026 logo
        ├── necklace-celestial-1.jpg   # Aura Celestial Sunburst Necklace (Tiger's Eye)
        ├── necklace-celestial-2.jpg   # Aura Celestial Sunburst Necklace (Editorial)
        ├── earrings-solitaire-hoops.jpg # Solitaire Dewdrop Huggie Hoops
        ├── bracelet-pave-link-bangle.jpg# Elysian Pave Diamond Link Bangle
        ├── ring-solitaire-band.jpg    # L'Etoile Solitaire Baguette Band Ring
        ├── hero-editorial-model.jpg   # Editorial campaign banner
        └── about-craftsmanship.jpg    # Master jeweler bench craftsman
```

---

## 🚀 Running Locally

1. **Start the Express server**:
   ```bash
   node server.js
   ```
   Or via npm:
   ```bash
   npm start
   ```

2. **Open in browser**:
   Visit [http://localhost:3000](http://localhost:3000)

---

## 💎 Features Included

1. **Homepage (`index.html`)**:
   - Announcement banner with insured delivery & 2026 atelier hallmark.
   - Luxury navigation with brand logo, wishlist badge, search trigger, and cart drawer.
   - Hero banner: *"Timeless Elegance, Crafted for You Since 2026"*.
   - Categories section (Rings, Necklaces, Earrings, Bracelets).
   - Dynamic featured creations grid with quick "Add to Bag", star ratings, and prices.
   - Editorial spotlight on the *Aura Celestial Sunburst* talisman necklace.
   - Bench jeweler atelier story with craftsmanship photography.
   - Press quotes and VIP Circle newsletter form.

2. **Catalog Page (`shop.html`)**:
   - Filter pills for *All Creations*, *Rings*, *Necklaces*, *Earrings*, and *Bracelets*.
   - Real-time sort options (Featured, Price: Low to High, Price: High to Low, Highest Rated).
   - Responsive grid with hover zoom, wishlist toggles, and detail view links.

3. **Product Detail Page (`product.html`)**:
   - Dynamic loading via URL parameter (`?id=bs-nk-01`).
   - Interactive thumbnail gallery switcher with high-resolution preview.
   - Metal swatch selector (*18k Yellow Gold*, *Rose Gold*, *Sterling Silver*).
   - Ring size selector (for rings) and interactive quantity counter.
   - "Add to Bag" and "Instant Checkout" buttons.
   - Expandable accordions for *Specifications*, *Materials & Care*, and *Packaging*.
   - Related pieces recommendation grid.

4. **Interactive Shopping Cart & Checkout Drawer**:
   - Smooth sliding right-side drawer.
   - Free shipping progress bar (calculated toward $250 complimentary threshold).
   - Quantity adjustment, item removal, and subtotal calculation.
   - Full checkout modal with shipping address form and instant order confirmation.

5. **Concierge & About Pages (`about.html`, `contact.html`)**:
   - The genesis and ethical foundation of Blush Stone.
   - Private showroom consultation booking and inquiry form.
   - FAQ accordion addressing ring sizing, insured shipping, and care rituals.

6. **Interactivity**:
   - Floating luxury notification toast on every cart and wishlist action.
   - Keyboard shortcut (`Ctrl+K` or `Cmd+K`) to open real-time search modal.
   - LocalStorage persistence for the shopping bag and wishlist.
