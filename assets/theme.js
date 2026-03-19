/* Celestial Theme — Main JavaScript */

document.addEventListener('DOMContentLoaded', function () {
  /* Sidebar menu */
  var menuToggle = document.querySelector('.header__menu-toggle');
  var sidebar = document.querySelector('.sidebar');
  var overlay = document.querySelector('.sidebar-overlay');
  var closeBtn = document.querySelector('.sidebar__close');

  function openSidebar() {
    sidebar.classList.add('is-open');
    overlay.classList.add('is-visible');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    sidebar.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', openSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);
  }

  /* ============================================
     AJAX Cart
     ============================================ */
  var cartContainer = document.querySelector('[data-cart-container]');

  if (cartContainer) {

    function cartFetch(url, body) {
      return fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(body)
      }).then(function(r) { return r.json(); });
    }

    function setItemLoading(lineIndex, active) {
      var item = cartContainer.querySelector('[data-cart-item][data-line-index="' + lineIndex + '"]');
      if (!item) return;
      var overlay = item.querySelector('[data-item-loading]');
      if (overlay) {
        overlay.classList.toggle('is-active', active);
        overlay.setAttribute('aria-hidden', String(!active));
      }
    }

    function formatMoney(cents) {
      return '$' + (cents / 100).toFixed(2);
    }

    function updateHeaderCartCount(count) {
      var badge = document.querySelector('[data-cart-count]');
      if (badge) badge.textContent = count;
    }

    function updateQuantity(lineIndex, newQuantity) {
      setItemLoading(lineIndex, true);

      cartFetch('/cart/change.js', { line: lineIndex, quantity: newQuantity })
        .then(function(cart) {
          if (newQuantity === 0) {
            window.location.reload();
            return;
          }

          var item = cartContainer.querySelector('[data-cart-item][data-line-index="' + lineIndex + '"]');
          if (item) {
            var cartItem = cart.items[lineIndex - 1];
            var linePriceEl = item.querySelector('[data-line-price]');
            if (linePriceEl && cartItem) {
              linePriceEl.textContent = formatMoney(cartItem.line_price);
            }
            var input = item.querySelector('.cart__quantity-input');
            if (input && cartItem) {
              input.value = cartItem.quantity;
            }
          }

          var subtotalEl = cartContainer.querySelector('[data-cart-subtotal]');
          if (subtotalEl) {
            subtotalEl.textContent = formatMoney(cart.total_price);
          }

          updateHeaderCartCount(cart.item_count);
          setItemLoading(lineIndex, false);
        })
        .catch(function() {
          setItemLoading(lineIndex, false);
          window.location.reload();
        });
    }

    cartContainer.addEventListener('click', function(e) {
      var qtyBtn = e.target.closest('.cart__quantity-btn');
      if (qtyBtn) {
        e.preventDefault();
        var lineIndex = parseInt(qtyBtn.dataset.lineIndex, 10);
        var input = qtyBtn.parentElement.querySelector('.cart__quantity-input');
        if (!input) return;
        var current = parseInt(input.value, 10) || 1;
        var newQty;
        if (qtyBtn.dataset.action === 'increase') {
          newQty = current + 1;
        } else {
          newQty = Math.max(0, current - 1);
        }
        input.value = newQty;
        updateQuantity(lineIndex, newQty);
        return;
      }

      var removeBtn = e.target.closest('[data-remove-item]');
      if (removeBtn) {
        e.preventDefault();
        var removeIndex = parseInt(removeBtn.dataset.lineIndex, 10);
        updateQuantity(removeIndex, 0);
        return;
      }
    });

    cartContainer.addEventListener('change', function(e) {
      if (e.target.matches('.cart__quantity-input')) {
        var lineIndex = parseInt(e.target.dataset.lineIndex, 10);
        var newQty = Math.max(0, parseInt(e.target.value, 10) || 0);
        updateQuantity(lineIndex, newQty);
      }
    });

    var noteTextarea = cartContainer.querySelector('#cart-note');
    if (noteTextarea) {
      var noteTimeout;
      noteTextarea.addEventListener('input', function() {
        clearTimeout(noteTimeout);
        noteTimeout = setTimeout(function() {
          fetch('/cart/update.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ note: noteTextarea.value })
          });
        }, 500);
      });
    }
  }

  /* ============================================
     Bagman Swing Animation (hover + reduced-motion)
     ============================================ */
  var bagWrapper = document.querySelector('.product__add-to-cart-wrapper');
  var bagAnim = document.querySelector('.bagman-bag animateTransform');

  if (bagWrapper && bagAnim) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      bagAnim.setAttribute('dur', '0s');
      bagAnim.setAttribute('values', '0 190 145;0 190 145;0 190 145;0 190 145;0 190 145');
    }

    bagWrapper.addEventListener('mouseenter', function () {
      bagAnim.setAttribute('values', '-12 190 145;0 190 145;12 190 145;0 190 145;-12 190 145');
      bagAnim.setAttribute('dur', '1.2s');
    });

    bagWrapper.addEventListener('mouseleave', function () {
      bagAnim.setAttribute('values', '-6 190 145;0 190 145;6 190 145;0 190 145;-6 190 145');
      bagAnim.setAttribute('dur', '2.5s');
    });
  }

  /* ============================================
     Header Bagman Swing Animation (hover + reduced-motion)
     ============================================ */
  var headerMascot = document.querySelector('.header__mascot');
  var headerBagAnim = headerMascot ? headerMascot.querySelector('.bagman-bag animateTransform') : null;

  if (headerMascot && headerBagAnim) {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      headerBagAnim.setAttribute('dur', '0s');
      headerBagAnim.setAttribute('values', '0 190 145;0 190 145;0 190 145;0 190 145;0 190 145');
    }

    headerMascot.addEventListener('mouseenter', function () {
      headerBagAnim.setAttribute('values', '-12 190 145;0 190 145;12 190 145;0 190 145;-12 190 145');
      headerBagAnim.setAttribute('dur', '1.2s');
    });

    headerMascot.addEventListener('mouseleave', function () {
      headerBagAnim.setAttribute('values', '-6 190 145;0 190 145;6 190 145;0 190 145;-6 190 145');
      headerBagAnim.setAttribute('dur', '2.5s');
    });
  }

  /* ============================================
     Product Accordions
     ============================================ */
  var accordionTriggers = document.querySelectorAll('.accordion__trigger');
  accordionTriggers.forEach(function(trigger) {
    trigger.addEventListener('click', function() {
      var expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!expanded));
      var content = document.getElementById(this.getAttribute('aria-controls'));
      if (content) {
        content.hidden = expanded;
      }
    });
  });

  /* ============================================
     Product Variant Buttons
     ============================================ */
  var variantInput = document.querySelector('[data-variant-input]');
  var variantDataEl = document.querySelector('[data-product-variants]');

  if (variantInput && variantDataEl) {
    var variants = JSON.parse(variantDataEl.textContent);

    document.querySelectorAll('.product__variant-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var siblings = this.closest('.product__option-values').querySelectorAll('.product__variant-btn');
        siblings.forEach(function(s) { s.classList.remove('is-active'); });
        this.classList.add('is-active');

        var selectedOptions = [];
        document.querySelectorAll('.product__option').forEach(function(optionGroup) {
          var activeBtn = optionGroup.querySelector('.product__variant-btn.is-active');
          if (activeBtn) {
            selectedOptions.push(activeBtn.dataset.value);
          }
        });

        var matchedVariant = variants.find(function(v) {
          return v.options.every(function(opt, i) {
            return opt === selectedOptions[i];
          });
        });

        if (matchedVariant) {
          variantInput.value = matchedVariant.id;

          var priceEl = document.querySelector('.product__price-current');
          if (priceEl) {
            var currency = priceEl.dataset.currency || 'USD';
            var formatted = (matchedVariant.price / 100).toLocaleString('en-US', {
              style: 'currency',
              currency: currency,
              minimumFractionDigits: 0
            });
            priceEl.textContent = formatted + ' ' + currency;
          }

          var addBtn = document.querySelector('.product__add-to-cart');
          if (addBtn) {
            addBtn.disabled = !matchedVariant.available;
            addBtn.textContent = matchedVariant.available ? 'ADD TO CART' : 'SOLD OUT';
          }
        }
      });
    });
  }
});
