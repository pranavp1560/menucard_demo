/* ==========================================================================
   LUXURY DIGITAL MENU - CORE LOGIC & INTERACTION (BISTRO REDESIGN)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // --- DOM Elements ---
  const preloader = document.getElementById('preloader');
  const navbarHeader = document.querySelector('header');
  const navMenu = document.querySelector('.nav-menu');
  const mobileHamburger = document.querySelector('.mobile-hamburger');
  const themeToggleBtn = document.querySelector('.theme-toggle-btn');
  const backToTopBtn = document.getElementById('backToTop');
  const categoryTabs = document.querySelectorAll('.category-tab');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const searchInput = document.getElementById('menuSearch');
  const foodCards = document.querySelectorAll('.food-card'); // menu rows act as foodCards
  const categoryGroups = document.querySelectorAll('.category-group');
  const noResultsDiv = document.querySelector('.no-results');
  
  // Detail Modal Elements
  const detailModal = document.getElementById('detailModal');
  const modalCloseBtn = document.querySelector('.modal-close-btn');
  const modalBackdrop = document.querySelector('.modal-backdrop');
  
  // Cart Drawer Elements
  const cartDrawer = document.getElementById('cartDrawer');
  const cartToggleBtn = document.querySelector('.cart-toggle-btn');
  const cartCloseBtn = document.querySelector('.cart-close-btn');
  const cartBackdrop = document.querySelector('.cart-drawer-backdrop');
  const cartItemsList = document.querySelector('.cart-items-list');
  const cartSubtotalPrice = document.querySelector('.cart-subtotal-price');
  const btnCheckoutWhatsapp = document.querySelector('.btn-checkout-whatsapp');
  const cartCountBadge = document.querySelector('.cart-count');
  const btnModalAddToCart = document.querySelector('.btn-modal-add-to-cart');

  // Lightbox Elements
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.querySelector('.lightbox-img');
  const lightboxCaption = document.querySelector('.lightbox-caption');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxPrev = document.querySelector('.lightbox-prev');
  const lightboxNext = document.querySelector('.lightbox-next');
  const galleryItems = document.querySelectorAll('.gallery-item');

  // WhatsApp Order Config
  const WHATSAPP_PHONE = '919876543210'; // Customizable phone number with country code
  
  // --- Cart State ---
  let cart = JSON.parse(localStorage.getItem('luxury-menu-cart')) || [];
  let currentlySelectedModalId = null; // Track item currently open in modal

  // --- 1. Preloader dismissal ---
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('hidden');
    }, 800); // Premium brief loading moment
  });
  
  // Backup timeout if window.onload takes too long
  setTimeout(() => {
    if (!preloader.classList.contains('hidden')) {
      preloader.classList.add('hidden');
    }
  }, 3000);

  // --- 2. Theme Toggle (Ivory & Gold / Ebony & Gold) ---
  const initTheme = () => {
    const savedTheme = localStorage.getItem('luxury-menu-theme') || 'light';
    document.documentElement.setAttribute('theme', savedTheme);
    updateThemeIcon(savedTheme);
  };

  const updateThemeIcon = (theme) => {
    const icon = themeToggleBtn.querySelector('i');
    if (theme === 'dark') {
      icon.className = 'fa-solid fa-sun';
    } else {
      icon.className = 'fa-solid fa-moon';
    }
  };

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('theme', newTheme);
    localStorage.setItem('luxury-menu-theme', newTheme);
    updateThemeIcon(newTheme);
    showToast(`Switched to ${newTheme === 'dark' ? "Ebony & Gold" : "Ivory & Gold"} theme`);
  });

  initTheme();

  // --- 3. Sticky Navbar & Back to Top Scroll Actions ---
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;
    
    // Navbar styling on scroll
    if (scrollPos > 50) {
      navbarHeader.classList.add('scrolled');
    } else {
      navbarHeader.classList.remove('scrolled');
    }

    // Back to top visibility
    if (scrollPos > 500) {
      backToTopBtn.classList.add('active');
    } else {
      backToTopBtn.classList.remove('active');
    }
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // --- 4. Mobile Navigation Menu ---
  const mobileNavBackdrop = document.createElement('div');
  mobileNavBackdrop.className = 'mobile-nav-backdrop';
  document.body.appendChild(mobileNavBackdrop);

  const toggleMobileNav = () => {
    mobileHamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    mobileNavBackdrop.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
  };

  mobileHamburger.addEventListener('click', toggleMobileNav);
  mobileNavBackdrop.addEventListener('click', toggleMobileNav);

  // Close mobile nav when linking to sections
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('active')) {
        toggleMobileNav();
      }
    });
  });

  // --- 5. Toast Notification System ---
  const showToast = (message) => {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${message}</span>`;
    
    container.appendChild(toast);

    // Fade out and remove toast
    setTimeout(() => {
      toast.style.animation = 'fadeUp 0.3s cubic-bezier(0.25, 1, 0.5, 1) reverse forwards';
      setTimeout(() => {
        toast.remove();
        if (container.children.length === 0) {
          container.remove();
        }
      }, 300);
    }, 2500);
  };

  // --- 6. Scroll Reveal Animation Setup ---
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target); // Reveal once
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // --- 7. Sticky Category Active Tab Tracker ---
  // Highlight active category tab during scrolling
  const activeCategoryObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const categoryId = entry.target.id;
        
        categoryTabs.forEach(tab => {
          if (tab.getAttribute('href') === `#${categoryId}`) {
            tab.classList.add('active');
            // Auto scroll category navigation horizontally if it overflows
            tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
          } else {
            tab.classList.remove('active');
          }
        });
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '-15% 0px -55% 0px'
  });

  categoryGroups.forEach(group => activeCategoryObserver.observe(group));

  // Handle smooth scroll clicks on navigation links (preventing layout jump)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      
      if (targetEl) {
        let offset = 140; // Default gap for header
        if (this.classList.contains('category-tab')) {
          offset = 160;
        }
        
        const targetPos = targetEl.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    });
  });

  // --- 8. Bookmark/Favorite Items (LocalStorage persistent) ---
  const favorites = JSON.parse(localStorage.getItem('luxury-menu-favorites')) || [];

  // Update card hearts according to local storage status
  foodCards.forEach(card => {
    const id = card.getAttribute('data-id');
    const favBtn = card.querySelector('.favorite-btn');
    if (favorites.includes(id)) {
      favBtn.classList.add('active');
      favBtn.querySelector('i').className = 'fa-solid fa-heart';
    }
  });

  document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Stop click from opening modal
      const card = btn.closest('.food-card');
      const id = card.getAttribute('data-id');
      const name = card.getAttribute('data-name');
      const icon = btn.querySelector('i');
      
      const index = favorites.indexOf(id);
      if (index === -1) {
        favorites.push(id);
        btn.classList.add('active');
        icon.className = 'fa-solid fa-heart';
        showToast(`Added ${name} to Favorites!`);
      } else {
        favorites.splice(index, 1);
        btn.classList.remove('active');
        icon.className = 'fa-regular fa-heart';
        showToast(`Removed ${name} from Favorites`);
      }
      localStorage.setItem('luxury-menu-favorites', JSON.stringify(favorites));
    });
  });

  // --- 9. Direct Clipboard Sharing ---
  document.querySelectorAll('.share-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Stop click from opening modal
      const card = btn.closest('.food-card');
      const id = card.getAttribute('data-id');
      const name = card.getAttribute('data-name');
      
      // Create share link pointing to specific card ID
      const shareUrl = `${window.location.origin}${window.location.pathname}#${id}`;
      
      navigator.clipboard.writeText(shareUrl).then(() => {
        showToast(`Copied share link for ${name}!`);
      }).catch(err => {
        showToast('Could not copy link automatically.');
        console.error('Sharing failed: ', err);
      });
    });
  });

  // --- 10. Combined Search & Filtering Logic ---
  let activeFilter = 'all';
  let searchQuery = '';

  const filterMenu = () => {
    let visibleCount = 0;
    
    // Group loops
    categoryGroups.forEach(group => {
      let groupHasMatches = false;
      const cardsInGroup = group.querySelectorAll('.food-card');
      
      cardsInGroup.forEach(card => {
        const name = card.getAttribute('data-name').toLowerCase();
        const desc = card.getAttribute('data-desc').toLowerCase();
        const category = card.getAttribute('data-category').toLowerCase();
        const type = card.getAttribute('data-type'); // veg or nonveg
        const isPopular = card.getAttribute('data-popular') === 'true';
        const isChef = card.getAttribute('data-chef') === 'true';

        // Check search match
        const searchMatches = 
          name.includes(searchQuery) || 
          desc.includes(searchQuery) || 
          category.includes(searchQuery);

        // Check filter tag match
        let filterMatches = false;
        if (activeFilter === 'all') {
          filterMatches = true;
        } else if (activeFilter === 'veg' && type === 'veg') {
          filterMatches = true;
        } else if (activeFilter === 'nonveg' && type === 'nonveg') {
          filterMatches = true;
        } else if (activeFilter === 'popular' && isPopular) {
          filterMatches = true;
        } else if (activeFilter === 'chef' && isChef) {
          filterMatches = true;
        }

        // Final visibility outcome
        if (searchMatches && filterMatches) {
          card.style.display = 'flex';
          // Trigger slight fade-in transition
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
          groupHasMatches = true;
          visibleCount++;
        } else {
          card.style.display = 'none';
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
        }
      });

      // Show/Hide category block if it contains no matching items
      if (groupHasMatches) {
        group.style.display = 'block';
      } else {
        group.style.display = 'none';
      }
    });

    // Handle no results display
    if (visibleCount === 0) {
      noResultsDiv.style.display = 'block';
    } else {
      noResultsDiv.style.display = 'none';
    }
  };

  // Search Input Trigger
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    filterMenu();
  });

  // Filter Button Triggers
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-filter');
      filterMenu();
    });
  });

  // --- 11. Food Details Modal (Interactive Menu Dialog) ---
  const openModal = (card) => {
    const id = card.getAttribute('data-id');
    currentlySelectedModalId = id; // Track target ID for add-to-cart inside modal
    
    const name = card.getAttribute('data-name');
    const price = card.getAttribute('data-price');
    const category = card.getAttribute('data-category');
    const desc = card.getAttribute('data-desc');
    const imgUrl = card.querySelector('.row-circle-img').src;
    const type = card.getAttribute('data-type');
    const prep = card.getAttribute('data-prep') || '15-20 mins';
    const calories = card.getAttribute('data-calories') || 'Approx. 350 kcal';
    const allergens = card.getAttribute('data-allergens') || 'None';
    const ingredients = card.getAttribute('data-ingredients') || 'Fresh premium selection';
    const isChef = card.getAttribute('data-chef') === 'true';
    const isPopular = card.getAttribute('data-popular') === 'true';

    // Populate Modal Content
    document.querySelector('.modal-detail-img').src = imgUrl;
    document.querySelector('.modal-detail-img').alt = name;
    document.querySelector('.modal-category').textContent = category;
    document.querySelector('.modal-title').textContent = name;
    document.querySelector('.modal-price').textContent = `₹${price}`;
    document.querySelector('.modal-desc').textContent = desc;
    
    document.getElementById('modalPrep').textContent = prep;
    document.getElementById('modalCalories').textContent = calories;
    document.getElementById('modalAllergens').textContent = allergens;
    document.getElementById('modalIngredients').textContent = ingredients;

    // Badges Generation
    const badgeContainer = document.querySelector('.modal-badges');
    badgeContainer.innerHTML = '';
    
    // Veg/Non Veg Badge
    const typeBadge = document.createElement('span');
    typeBadge.className = `badge-tag ${type}`;
    typeBadge.innerHTML = `<span class="food-type-icon ${type}"></span> ${type === 'veg' ? 'Veg' : 'Non-Veg'}`;
    badgeContainer.appendChild(typeBadge);

    // Chef special badge
    if (isChef) {
      const chefBadge = document.createElement('span');
      chefBadge.className = 'badge-tag chef-special';
      chefBadge.innerHTML = `<i class="fa-solid fa-star"></i> Chef's Choice`;
      badgeContainer.appendChild(chefBadge);
    }

    // Popular badge
    if (isPopular) {
      const popBadge = document.createElement('span');
      popBadge.className = 'badge-tag popular';
      popBadge.innerHTML = `<i class="fa-solid fa-fire"></i> Popular`;
      badgeContainer.appendChild(popBadge);
    }

    // Open Modal UI
    detailModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    detailModal.classList.remove('active');
    if (!cartDrawer.classList.contains('active')) {
      document.body.style.overflow = '';
    }
    currentlySelectedModalId = null;
  };

  // Card click bindings
  foodCards.forEach(card => {
    card.addEventListener('click', (e) => {
      // Exclude clicks on action buttons
      if (e.target.closest('.card-action-btn') || e.target.closest('.btn-add-order')) {
        return;
      }
      openModal(card);
    });
  });

  // Modal close triggers
  modalCloseBtn.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', closeModal);

  // --- 12. Interactive Cart Drawer & Checkout Operations ---
  
  // Render Cart Items
  const renderCart = () => {
    cartItemsList.innerHTML = '';
    let total = 0;
    let itemCount = 0;

    if (cart.length === 0) {
      cartItemsList.innerHTML = `
        <div class="cart-empty-message">
          <i class="fa-solid fa-bag-shopping"></i>
          <p>Your order is empty.</p>
          <p style="font-size: 0.75rem;">Add some delicacies from our menu!</p>
        </div>
      `;
      btnCheckoutWhatsapp.style.pointerEvents = 'none';
      btnCheckoutWhatsapp.style.opacity = '0.5';
    } else {
      btnCheckoutWhatsapp.style.pointerEvents = 'auto';
      btnCheckoutWhatsapp.style.opacity = '1';

      cart.forEach((item, index) => {
        total += item.price * item.qty;
        itemCount += item.qty;

        const row = document.createElement('div');
        row.className = 'cart-item-row';
        row.innerHTML = `
          <div class="cart-item-info">
            <span class="cart-item-name">${item.name}</span>
            <span class="cart-item-price">₹${item.price} × ${item.qty}</span>
          </div>
          <div class="cart-item-qty-controls">
            <button class="qty-btn dec-qty-btn" data-index="${index}">-</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn inc-qty-btn" data-index="${index}">+</button>
          </div>
        `;
        cartItemsList.appendChild(row);
      });
    }

    // Update prices & labels
    cartSubtotalPrice.textContent = `₹${total}`;
    cartCountBadge.textContent = `${itemCount} item${itemCount !== 1 ? 's' : ''}`;
    localStorage.setItem('luxury-menu-cart', JSON.stringify(cart));

    // Bind quantity increment/decrement controls
    document.querySelectorAll('.dec-qty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(btn.getAttribute('data-index'));
        if (cart[index].qty > 1) {
          cart[index].qty--;
        } else {
          showToast(`Removed ${cart[index].name} from order`);
          cart.splice(index, 1);
        }
        renderCart();
      });
    });

    document.querySelectorAll('.inc-qty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(btn.getAttribute('data-index'));
        cart[index].qty++;
        renderCart();
      });
    });

    // Compile WhatsApp Checkout Link
    compileWhatsAppLink(total);
  };

  // Compile multi-item WhatsApp message
  const compileWhatsAppLink = (total) => {
    if (cart.length === 0) {
      btnCheckoutWhatsapp.href = '';
      return;
    }

    let message = `Hello! I would like to place an order from L'Ambrosia Modern Bistro:\n`;
    message += `----------------------------------------\n`;
    cart.forEach(item => {
      message += `- *${item.qty}x* ${item.name} (₹${item.price * item.qty})\n`;
    });
    message += `----------------------------------------\n`;
    message += `*Subtotal:* ₹${total}\n\n`;
    message += `Please confirm my order. Thank you!`;

    const encoded = encodeURIComponent(message);
    btnCheckoutWhatsapp.href = `https://wa.me/${WHATSAPP_PHONE}?text=${encoded}`;
  };

  // Add Item to Cart
  const addItemToCart = (id, name, price) => {
    const existing = cart.find(item => item.id === id);
    if (existing) {
      existing.qty++;
    } else {
      cart.push({ id, name, price: parseInt(price), qty: 1 });
    }
    renderCart();
    showToast(`Added ${name} to order`);
    
    // Auto-open cart drawer for instant visual confirmation
    openCartDrawer();
  };

  // Click additions inside menu list rows
  document.querySelectorAll('.btn-add-order').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation(); // Stop click from opening modal
      const card = btn.closest('.food-card');
      const id = card.getAttribute('data-id');
      const name = card.getAttribute('data-name');
      const price = card.getAttribute('data-price');
      addItemToCart(id, name, price);
    });
  });

  // Modal Add-to-cart button trigger
  btnModalAddToCart.addEventListener('click', () => {
    if (currentlySelectedModalId) {
      const card = document.querySelector(`.food-card[data-id="${currentlySelectedModalId}"]`);
      if (card) {
        const name = card.getAttribute('data-name');
        const price = card.getAttribute('data-price');
        addItemToCart(currentlySelectedModalId, name, price);
        closeModal();
      }
    }
  });

  // Cart Drawer open/close controls
  const openCartDrawer = () => {
    cartDrawer.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeCartDrawer = () => {
    cartDrawer.classList.remove('active');
    if (!detailModal.classList.contains('active') && !navMenu.classList.contains('active')) {
      document.body.style.overflow = '';
    }
  };

  cartToggleBtn.addEventListener('click', openCartDrawer);
  cartCloseBtn.addEventListener('click', closeCartDrawer);
  cartBackdrop.addEventListener('click', closeCartDrawer);

  // Initialize Cart drawer state
  renderCart();

  // --- 13. Deep-Linking Hash Handler ---
  // Open modal if page URL contains dish hash (e.g. menu.html#dish-chicken-65)
  const handleUrlHash = () => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#')) {
      const cleanId = hash.substring(1);
      const targetCard = document.querySelector(`.food-card[data-id="${cleanId}"]`);
      if (targetCard) {
        // Expand the category group display if it's currently hidden by filters
        activeFilter = 'all';
        searchQuery = '';
        searchInput.value = '';
        filterBtns.forEach(b => b.classList.remove('active'));
        document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
        filterMenu();

        // Scroll to card first, then open modal
        setTimeout(() => {
          const offset = 180;
          const pos = targetCard.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: pos, behavior: 'smooth' });
          openModal(targetCard);
        }, 300);
      }
    }
  };

  // Run on page load
  setTimeout(handleUrlHash, 1000);
  // Listen for hash changes
  window.addEventListener('hashchange', handleUrlHash);

  // --- 14. Premium Lightbox Gallery ---
  let activeGalleryIndex = 0;
  const galleryImageUrls = [];
  const galleryImageCaptions = [];

  // Parse Gallery Elements
  galleryItems.forEach((item, index) => {
    const img = item.querySelector('img');
    const caption = item.querySelector('.gallery-overlay span').textContent;
    galleryImageUrls.push(img.src);
    galleryImageCaptions.push(caption);

    item.addEventListener('click', () => {
      activeGalleryIndex = index;
      openLightbox();
    });
  });

  const openLightbox = () => {
    updateLightboxContent();
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    if (!detailModal.classList.contains('active') && !cartDrawer.classList.contains('active')) {
      document.body.style.overflow = '';
    }
  };

  const updateLightboxContent = () => {
    lightboxImg.src = galleryImageUrls[activeGalleryIndex];
    lightboxImg.alt = galleryImageCaptions[activeGalleryIndex];
    lightboxCaption.textContent = galleryImageCaptions[activeGalleryIndex];
  };

  const navigateLightbox = (direction) => {
    if (direction === 'prev') {
      activeGalleryIndex = (activeGalleryIndex - 1 + galleryImageUrls.length) % galleryImageUrls.length;
    } else {
      activeGalleryIndex = (activeGalleryIndex + 1) % galleryImageUrls.length;
    }
    updateLightboxContent();
  };

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => navigateLightbox('prev'));
  lightboxNext.addEventListener('click', () => navigateLightbox('next'));
  
  // Close lightbox if clicking backdrop
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Swipe Gestures or Keyboard for Lightbox
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeLightbox();
      closeCartDrawer();
    }
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'ArrowLeft') {
      navigateLightbox('prev');
    } else if (e.key === 'ArrowRight') {
      navigateLightbox('next');
    }
  });
  
});
