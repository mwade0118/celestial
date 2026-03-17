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
});
