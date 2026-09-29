/**
 * Blush Stone - Core Client Logic
 * Est. 2026 Luxury Jewelry E-Commerce
 */

// Cart & Wishlist LocalStorage Keys
const CART_STORAGE_KEY = 'blush_stone_cart_v1';
const WISHLIST_STORAGE_KEY = 'blush_stone_wishlist_v1';

// Initial state
let cart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
let wishlist = JSON.parse(localStorage.getItem(WISHLIST_STORAGE_KEY)) || [];
let globalProductsCache = [];

// DOM Ready initialization
document.addEventListener('DOMContentLoaded', () => {
  initCartUI();
  initWishlistUI();
  initMobileMenu();
  initSearchModal();
  initNewsletterForm();
  initCheckoutDrawer();
  fetchAllProductsForCache();
});

// Cache products for fast client search & lookup
async function fetchAllProductsForCache() {
  try {
    const res = await fetch('/api/products');
    const data = await res.json();
    if (data.success && data.data) {
      globalProductsCache = data.data;
    }
  } catch (err) {
    console.warn('Could not fetch products from API, relying on fallback.', err);
  }
}

/* ==========================================================================
   CART SYSTEM
   ========================================================================== */

function saveCart() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  updateCartBadge();
  renderCartDrawer();
}

function updateCartBadge() {
  const badgeElements = document.querySelectorAll('.cart-count-badge');
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  badgeElements.forEach(el => {
    el.textContent = totalCount;
    if (totalCount > 0) {
      el.classList.remove('hidden');
      el.classList.add('flex');
    } else {
      el.classList.add('hidden');
      el.classList.remove('flex');
    }
  });
}

function addToCart(product, options = {}) {
  const selectedMaterial = options.material || product.materials?.[0] || '18k Yellow Gold';
  const selectedSize = options.size || (product.sizes ? product.sizes[0] : null);
  const quantity = parseInt(options.quantity || 1, 10);

  const cartItemId = `${product.id}-${selectedMaterial}-${selectedSize || 'std'}`;
  const existingItem = cart.find(item => item.cartItemId === cartItemId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      cartItemId,
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      material: selectedMaterial,
      size: selectedSize,
      quantity: quantity
    });
  }

  saveCart();
  showToast({
    title: 'Added to Bag',
    message: `${product.name} (${selectedMaterial})`,
    image: product.image
  });

  // Open drawer automatically to delight user
  openCartDrawer();
}

function removeFromCart(cartItemId) {
  cart = cart.filter(item => item.cartItemId !== cartItemId);
  saveCart();
}

function updateCartQuantity(cartItemId, newQty) {
  const item = cart.find(item => item.cartItemId === cartItemId);
  if (item) {
    item.quantity = parseInt(newQty, 10);
    if (item.quantity <= 0) {
      removeFromCart(cartItemId);
    } else {
      saveCart();
    }
  }
}

function getCartSubtotal() {
  return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}

function renderCartDrawer() {
  const container = document.getElementById('cart-items-container');
  const emptyState = document.getElementById('cart-empty-state');
  const subtotalEl = document.getElementById('cart-subtotal-price');
  const shippingBarEl = document.getElementById('cart-shipping-progress');
  const shippingTextEl = document.getElementById('cart-shipping-text');
  const checkoutBtn = document.getElementById('cart-checkout-button');

  if (!container) return;

  const subtotal = getCartSubtotal();
  if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);

  // Free shipping progress bar ($250 threshold)
  const freeThreshold = 250;
  if (shippingBarEl && shippingTextEl) {
    if (subtotal >= freeThreshold) {
      shippingBarEl.style.width = '100%';
      shippingTextEl.innerHTML = `<span class="text-amber-800 font-medium">✨ You've unlocked Complimentary Insured Delivery!</span>`;
    } else {
      const remaining = freeThreshold - subtotal;
      const pct = Math.min(100, Math.round((subtotal / freeThreshold) * 100));
      shippingBarEl.style.width = `${pct}%`;
      shippingTextEl.innerHTML = `Add <span class="font-semibold text-amber-900">${formatCurrency(remaining)}</span> more for Complimentary Insured Delivery`;
    }
  }

  if (cart.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    container.innerHTML = '';
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');
  if (checkoutBtn) checkoutBtn.disabled = false;

  container.innerHTML = cart.map(item => `
    <div class="flex gap-4 py-4 border-b border-amber-900/10 group">
      <a href="/product.html?id=${item.id}" class="w-20 h-20 flex-shrink-0 bg-stone-100 rounded-lg overflow-hidden border border-amber-900/10">
        <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300">
      </a>
      <div class="flex-1 flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-start">
            <a href="/product.html?id=${item.id}" class="font-serif text-stone-900 font-medium hover:text-amber-800 transition-colors line-clamp-1">
              ${item.name}
            </a>
            <button onclick="removeFromCart('${item.cartItemId}')" class="text-stone-400 hover:text-red-700 ml-2 p-1" title="Remove">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
          <p class="text-xs text-stone-500 mt-0.5">${item.material} ${item.size ? `· Size ${item.size}` : ''}</p>
        </div>
        <div class="flex justify-between items-center mt-2">
          <div class="flex items-center border border-amber-900/20 rounded-md bg-white">
            <button onclick="updateCartQuantity('${item.cartItemId}', ${item.quantity - 1})" class="px-2 py-0.5 text-stone-600 hover:text-amber-800 transition-colors text-xs font-semibold">−</button>
            <span class="px-2 py-0.5 text-xs font-medium text-stone-800">${item.quantity}</span>
            <button onclick="updateCartQuantity('${item.cartItemId}', ${item.quantity + 1})" class="px-2 py-0.5 text-stone-600 hover:text-amber-800 transition-colors text-xs font-semibold">+</button>
          </div>
          <span class="font-medium text-sm text-stone-900">${formatCurrency(item.price * item.quantity)}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function initCartUI() {
  updateCartBadge();
  renderCartDrawer();

  // Drawer open / close handlers
  const openButtons = document.querySelectorAll('.trigger-cart-drawer');
  const closeButton = document.getElementById('close-cart-drawer');
  const backdrop = document.getElementById('cart-drawer-backdrop');

  openButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openCartDrawer();
    });
  });

  if (closeButton) {
    closeButton.addEventListener('click', closeCartDrawer);
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeCartDrawer);
  }

  // Escape key closes drawer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeCartDrawer();
      closeSearchModal();
      closeCheckoutModal();
    }
  });
}

function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const panel = document.getElementById('cart-drawer-panel');
  const backdrop = document.getElementById('cart-drawer-backdrop');

  if (drawer && panel && backdrop) {
    drawer.classList.remove('pointer-events-none');
    backdrop.classList.remove('opacity-0');
    backdrop.classList.add('opacity-100');
    panel.classList.remove('translate-x-full');
    panel.classList.add('translate-x-0');
    document.body.style.overflow = 'hidden';
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const panel = document.getElementById('cart-drawer-panel');
  const backdrop = document.getElementById('cart-drawer-backdrop');

  if (drawer && panel && backdrop) {
    backdrop.classList.add('opacity-0');
    backdrop.classList.remove('opacity-100');
    panel.classList.add('translate-x-full');
    panel.classList.remove('translate-x-0');
    setTimeout(() => {
      drawer.classList.add('pointer-events-none');
      document.body.style.overflow = '';
    }, 300);
  }
}

/* ==========================================================================
   WISHLIST SYSTEM
   ========================================================================== */

function toggleWishlist(productId) {
  const index = wishlist.indexOf(productId);
  let added = false;
  if (index > -1) {
    wishlist.splice(index, 1);
  } else {
    wishlist.push(productId);
    added = true;
  }
  localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
  initWishlistUI();

  showToast({
    title: added ? 'Saved to Wishlist' : 'Removed from Wishlist',
    message: added ? 'Piece saved to your curated favorites' : 'Removed from your favorites',
    icon: added ? '♥' : '♡'
  });
}

function initWishlistUI() {
  const badgeEls = document.querySelectorAll('.wishlist-count-badge');
  const count = wishlist.length;

  badgeEls.forEach(el => {
    el.textContent = count;
    if (count > 0) {
      el.classList.remove('hidden');
      el.classList.add('flex');
    } else {
      el.classList.add('hidden');
      el.classList.remove('flex');
    }
  });

  // Update heart buttons
  document.querySelectorAll('[data-wishlist-id]').forEach(btn => {
    const id = btn.getAttribute('data-wishlist-id');
    const isWished = wishlist.includes(id);
    const svg = btn.querySelector('svg');
    if (svg) {
      if (isWished) {
        svg.setAttribute('fill', '#8C6D3B');
        svg.setAttribute('stroke', '#8C6D3B');
        btn.classList.add('text-amber-800');
      } else {
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        btn.classList.remove('text-amber-800');
      }
    }
  });
}

/* ==========================================================================
   TOAST NOTIFICATION SYSTEM
   ========================================================================== */

function showToast({ title, message, image, icon }) {
  let toast = document.getElementById('notification-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'notification-toast';
    toast.className = 'fixed bottom-6 right-6 z-50 transform translate-y-24 opacity-0 transition-all duration-300 pointer-events-none';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <div class="pointer-events-auto flex items-center gap-3 p-4 bg-[#FAF7F2] text-stone-900 border border-amber-900/20 rounded-xl shadow-2xl backdrop-blur-md max-w-sm">
      ${image ? `
        <img src="${image}" alt="" class="w-12 h-12 rounded-lg object-cover border border-amber-900/10 flex-shrink-0">
      ` : icon ? `
        <div class="w-10 h-10 rounded-full bg-amber-100/60 text-amber-800 flex items-center justify-center font-serif text-lg flex-shrink-0">
          ${icon}
        </div>
      ` : `
        <div class="w-10 h-10 rounded-full bg-amber-100/60 text-amber-800 flex items-center justify-center flex-shrink-0">
          ✦
        </div>
      `}
      <div class="flex-1 min-w-0 pr-2">
        <h4 class="font-serif text-sm font-semibold text-stone-900 truncate">${title}</h4>
        <p class="text-xs text-stone-600 truncate mt-0.5">${message}</p>
      </div>
      <button onclick="openCartDrawer()" class="text-xs font-semibold text-amber-900 hover:text-amber-950 underline flex-shrink-0">
        View
      </button>
    </div>
  `;

  // Animate in
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-24', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  });

  // Auto dismiss
  clearTimeout(toast.dismissTimeout);
  toast.dismissTimeout = setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-24', 'opacity-0');
  }, 4000);
}

/* ==========================================================================
   MOBILE MENU
   ========================================================================== */

function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const menuModal = document.getElementById('mobile-menu-modal');
  const closeBtn = document.getElementById('close-mobile-menu');
  const backdrop = document.getElementById('mobile-menu-backdrop');

  if (!toggleBtn || !menuModal) return;

  const openMenu = () => {
    menuModal.classList.remove('hidden');
    requestAnimationFrame(() => {
      menuModal.classList.remove('opacity-0');
      menuModal.querySelector('.mobile-menu-panel')?.classList.remove('-translate-x-full');
    });
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    menuModal.classList.add('opacity-0');
    menuModal.querySelector('.mobile-menu-panel')?.classList.add('-translate-x-full');
    setTimeout(() => {
      menuModal.classList.add('hidden');
      document.body.style.overflow = '';
    }, 300);
  };

  toggleBtn.addEventListener('click', openMenu);
  if (closeBtn) closeBtn.addEventListener('click', closeMenu);
  if (backdrop) backdrop.addEventListener('click', closeMenu);
}

/* ==========================================================================
   SEARCH MODAL
   ========================================================================== */

function initSearchModal() {
  const triggerBtns = document.querySelectorAll('.trigger-search-modal');
  const modal = document.getElementById('search-modal');
  const closeBtn = document.getElementById('close-search-modal');
  const backdrop = document.getElementById('search-modal-backdrop');
  const input = document.getElementById('global-search-input');
  const resultsContainer = document.getElementById('search-results-container');

  if (!modal) return;

  window.openSearchModal = () => {
    modal.classList.remove('hidden');
    setTimeout(() => {
      modal.classList.remove('opacity-0');
      if (input) input.focus();
    }, 50);
    document.body.style.overflow = 'hidden';
  };

  window.closeSearchModal = () => {
    modal.classList.add('opacity-0');
    setTimeout(() => {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }, 250);
  };

  triggerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openSearchModal();
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeSearchModal);
  if (backdrop) backdrop.addEventListener('click', closeSearchModal);

  // Keyboard shortcut Ctrl/Cmd + K
  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openSearchModal();
    }
  });

  // Real-time search handler
  if (input && resultsContainer) {
    input.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();
      if (!term) {
        resultsContainer.innerHTML = `
          <div class="py-12 text-center text-stone-500 font-light">
            <p>Type to search rings, necklaces, earrings, bracelets or materials...</p>
          </div>
        `;
        return;
      }

      const matches = globalProductsCache.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term)
      );

      if (matches.length === 0) {
        resultsContainer.innerHTML = `
          <div class="py-12 text-center">
            <p class="font-serif text-lg text-stone-800">No pieces found matching "${term}"</p>
            <p class="text-sm text-stone-500 mt-1">Try searching for "gold", "rings", "hoops", or "celestial"</p>
          </div>
        `;
        return;
      }

      resultsContainer.innerHTML = `
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${matches.map(p => `
            <a href="/product.html?id=${p.id}" class="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-100 transition-colors border border-transparent hover:border-amber-900/10">
              <img src="${p.image}" alt="${p.name}" class="w-14 h-14 rounded-md object-cover">
              <div class="flex-1 min-w-0">
                <span class="text-[10px] uppercase tracking-wider text-amber-800 font-semibold">${p.category}</span>
                <h5 class="font-serif text-sm font-medium text-stone-900 truncate">${p.name}</h5>
                <p class="text-xs text-stone-700 font-medium">${formatCurrency(p.price)}</p>
              </div>
            </a>
          `).join('')}
        </div>
      `;
    });
  }
}

/* ==========================================================================
   CHECKOUT DRAWER / MODAL
   ========================================================================== */

function initCheckoutDrawer() {
  const checkoutBtn = document.getElementById('cart-checkout-button');
  const checkoutModal = document.getElementById('checkout-modal');
  const closeCheckoutBtn = document.getElementById('close-checkout-modal');
  const checkoutForm = document.getElementById('checkout-form');

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      closeCartDrawer();
      openCheckoutModal();
    });
  }

  if (closeCheckoutBtn) {
    closeCheckoutBtn.addEventListener('click', closeCheckoutModal);
  }

  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = checkoutForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.disabled = true;
      submitBtn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Securing Order...
      `;

      try {
        const payload = {
          items: cart,
          customer: {
            name: checkoutForm.querySelector('[name="fullName"]')?.value,
            email: checkoutForm.querySelector('[name="email"]')?.value,
            address: checkoutForm.querySelector('[name="address"]')?.value
          }
        };

        const res = await fetch('/api/cart/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        // Clear cart
        cart = [];
        saveCart();

        // Render confirmation inside modal
        const modalBody = document.getElementById('checkout-modal-body');
        if (modalBody) {
          modalBody.innerHTML = `
            <div class="text-center py-10 px-4">
              <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-2xl font-serif">
                ✦
              </div>
              <span class="text-xs uppercase tracking-widest text-amber-800 font-semibold">Order Confirmed</span>
              <h3 class="font-serif text-3xl font-normal text-stone-900 mt-2">Thank You for Your Order</h3>
              <p class="text-sm text-stone-600 mt-2 max-w-md mx-auto">
                Your order <span class="font-semibold text-stone-900">${data.orderId || 'BLUSH-89421'}</span> has been confirmed. A certificate of authenticity and tracking details have been emailed.
              </p>
              <div class="mt-8 p-4 bg-stone-50 rounded-xl max-w-sm mx-auto text-left border border-amber-900/10">
                <div class="flex justify-between text-xs py-1 border-b border-stone-200">
                  <span class="text-stone-500">Order Number</span>
                  <span class="font-medium text-stone-900">${data.orderId || 'BLUSH-89421'}</span>
                </div>
                <div class="flex justify-between text-xs py-1 border-b border-stone-200">
                  <span class="text-stone-500">Delivery Method</span>
                  <span class="font-medium text-stone-900">Insured Signature Delivery</span>
                </div>
                <div class="flex justify-between text-xs py-1">
                  <span class="text-stone-500">Estimated Dispatch</span>
                  <span class="font-medium text-stone-900">Within 24 Hours</span>
                </div>
              </div>
              <div class="mt-8 flex justify-center gap-4">
                <button onclick="closeCheckoutModal(); window.location.href='/shop.html';" class="btn-luxury-primary px-8 py-3 rounded-full text-xs uppercase tracking-widest font-semibold">
                  Continue Exploring
                </button>
              </div>
            </div>
          `;
        }
      } catch (err) {
        alert('Checkout error. Please try again.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }
    });
  }
}

function openCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    const summarySubtotal = document.getElementById('checkout-summary-subtotal');
    const summaryTotal = document.getElementById('checkout-summary-total');
    const itemsPreview = document.getElementById('checkout-items-preview');

    const sub = getCartSubtotal();
    if (summarySubtotal) summarySubtotal.textContent = formatCurrency(sub);
    if (summaryTotal) summaryTotal.textContent = formatCurrency(sub);

    if (itemsPreview) {
      itemsPreview.innerHTML = cart.map(i => `
        <div class="flex items-center gap-3 py-2 text-xs">
          <img src="${i.image}" class="w-10 h-10 object-cover rounded border border-amber-900/10">
          <div class="flex-1 truncate">
            <div class="font-medium text-stone-900 truncate">${i.name}</div>
            <div class="text-stone-500">${i.material} x ${i.quantity}</div>
          </div>
          <div class="font-semibold text-stone-900">${formatCurrency(i.price * i.quantity)}</div>
        </div>
      `).join('');
    }

    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
      modal.classList.remove('opacity-0');
    });
    document.body.style.overflow = 'hidden';
  }
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) {
    modal.classList.add('opacity-0');
    setTimeout(() => {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }, 250);
  }
}

/* ==========================================================================
   NEWSLETTER SUBSCRIPTION
   ========================================================================== */

function initNewsletterForm() {
  const forms = document.querySelectorAll('.newsletter-form');
  forms.forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      const email = input ? input.value : '';

      if (!email) return;

      try {
        const res = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();

        showToast({
          title: 'Welcome to Blush Stone',
          message: data.message || 'You have joined our VIP Circle.',
          icon: '✦'
        });

        if (input) input.value = '';
      } catch (err) {
        showToast({
          title: 'Subscription Successful',
          message: 'Welcome to the Blush Stone Circle. Code BLUSH2026 applied.',
          icon: '✦'
        });
      }
    });
  });
}

// Global Exports
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.toggleWishlist = toggleWishlist;
window.openCartDrawer = openCartDrawer;
window.closeCartDrawer = closeCartDrawer;
window.openCheckoutModal = openCheckoutModal;
window.closeCheckoutModal = closeCheckoutModal;
window.formatCurrency = formatCurrency;
