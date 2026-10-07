/**
 * Navis ERP Wireframe System - Shared JavaScript
 * Provides sidebar, header, footer rendering and common UI utilities.
 * Vanilla JS only, no frameworks.
 */

(function (window) {
  'use strict';

  // ── Menu Structure Definition ──────────────────────────────────────

  var menuData = [
    {
      label: 'Quản lý kho',
      icon: 'inventory_2',
      id: 'menu-quan-ly-kho',
      children: [
        { label: 'Đơn vị thuê kho', badge: 'Mới', href: 'w01-don-vi-thue-kho.html' },
        { label: 'Điều chuyển vị trí', badge: 'Mới', href: 'w05-dieu-chuyen-vi-tri.html' },
        { label: 'Nhập kho', badge: 'Nâng cấp', href: 'w08-danh-sach-nhap-kho.html' },
        { label: 'Xuất kho', badge: 'Nâng cấp', href: 'w10-danh-sach-xuat-kho.html' }
      ]
    },
    {
      label: 'Quản lý sản phẩm',
      icon: 'category',
      id: 'menu-quan-ly-san-pham',
      children: [
        { label: 'Vị trí hàng hoá / Sơ đồ kho', badge: 'Nâng cấp', href: 'w03-so-do-kho.html' },
        { label: 'Tra cứu tồn kho', badge: 'Nâng cấp', href: 'w12-tra-cuu-ton-kho.html' }
      ]
    },
    {
      label: 'Cấu hình',
      icon: 'settings',
      id: 'menu-cau-hinh',
      children: [
        { label: 'Phân quyền', badge: 'Mới', href: 'w14-phan-quyen.html' }
      ]
    }
  ];

  // ── Utility: escape HTML ───────────────────────────────────────────

  function esc(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // ── Sidebar ────────────────────────────────────────────────────────

  /**
   * Determine which parent menu (if any) owns the given page filename,
   * and whether a child href matches it exactly.
   */
  function findActiveInfo(activeMenu) {
    for (var i = 0; i < menuData.length; i++) {
      var item = menuData[i];
      if (item.children) {
        for (var j = 0; j < item.children.length; j++) {
          if (item.children[j].href === activeMenu) {
            return { parentId: item.id, childHref: item.children[j].href };
          }
        }
      }
      if (item.href === activeMenu) {
        return { parentId: null, childHref: null, topLabel: item.label };
      }
    }
    return null;
  }

  function buildMenuHTML(activeMenu) {
    var info = findActiveInfo(activeMenu);
    var html = '';

    for (var i = 0; i < menuData.length; i++) {
      var item = menuData[i];

      if (item.children) {
        // Always expanded — keep sidebar consistent across all pages
        var isExpanded = true;
        var expandedClass = ' sidebar-submenu--expanded';
        var arrowChar = '&#9660;';

        var iconHTML = item.icon ? '<span class="material-icons-outlined menu-icon">' + esc(item.icon) + '</span>' : '';

        html += '<li class="sidebar-menu-item sidebar-menu-item--parent">';
        html += '<div class="sidebar-menu-link sidebar-menu-link--toggle" data-submenu="' + esc(item.id) + '">';
        html += iconHTML;
        html += '<span class="sidebar-menu-label">' + esc(item.label) + '</span>';
        html += '<span class="sidebar-menu-arrow">' + arrowChar + '</span>';
        html += '</div>';
        html += '<ul id="' + esc(item.id) + '" class="sidebar-submenu' + expandedClass + '">';

        for (var j = 0; j < item.children.length; j++) {
          var child = item.children[j];
          var isActive = child.href === activeMenu;
          var activeClass = isActive ? ' sidebar-submenu-link--active' : '';
          var badgeClass = 'sidebar-badge';
          if (child.badge === 'Nâng cấp') badgeClass += ' sidebar-badge--upgrade';
          var badgeHTML = child.badge
            ? ' <span class="' + badgeClass + '">' + esc(child.badge) + '</span>'
            : '';

          html += '<li class="sidebar-submenu-item">';
          html += '<a href="' + esc(child.href) + '" class="sidebar-submenu-link' + activeClass + '">';
          html += esc(child.label) + badgeHTML;
          html += '</a></li>';
        }

        html += '</ul></li>';
      } else {
        // Simple top-level link
        var topActive = info && info.topLabel === item.label;
        var topClass = topActive ? ' sidebar-menu-link--active' : '';
        var topIconHTML = item.icon ? '<span class="material-icons-outlined menu-icon">' + esc(item.icon) + '</span>' : '';

        html += '<li class="sidebar-menu-item">';
        html += '<a href="' + esc(item.href) + '" class="sidebar-menu-link' + topClass + '">';
        html += topIconHTML;
        html += '<span class="sidebar-menu-label">' + esc(item.label) + '</span>';
        html += '</a></li>';
      }
    }

    return html;
  }

  /**
   * Render the sidebar into the element with id="sidebar".
   * @param {string} activeMenu - filename of the current page, e.g. "w01-don-vi-thue-kho.html"
   */
  function renderSidebar(activeMenu) {
    var el = document.getElementById('sidebar');
    if (!el) return;

    // Ensure sidebar class is always present
    if (!el.classList.contains('sidebar')) {
      el.classList.add('sidebar');
    }

    var html = '';

    // User info (centered, like live site)
    html += '<div class="sidebar-user">';
    html += '<div class="sidebar-user-avatar"><span class="material-icons-outlined" style="font-size:28px;opacity:0.7">person</span></div>';
    html += '<div class="sidebar-user-details">';
    html += '<div class="sidebar-user-role">Director - Admin</div>';
    html += '<div class="sidebar-user-id">AD-00003</div>';
    html += '</div>';
    html += '</div>';

    // Divider
    html += '<hr class="sidebar-divider">';

    // Menu
    html += '<nav class="sidebar-nav">';
    html += '<ul class="sidebar-menu">';
    html += buildMenuHTML(activeMenu || '');
    html += '</ul>';
    html += '</nav>';

    el.innerHTML = html;

    // Attach event delegation for sub-menu toggles
    el.addEventListener('click', function (e) {
      var toggle = e.target.closest('.sidebar-menu-link--toggle');
      if (!toggle) return;
      e.preventDefault();
      var menuId = toggle.getAttribute('data-submenu');
      if (menuId) {
        toggleSubMenu(menuId);
      }
    });
  }

  // ── Header ─────────────────────────────────────────────────────────

  /**
   * Render the top header bar into the element with id="header".
   * @param {string} title - page title displayed in the header
   */
  function renderHeader(title) {
    var el = document.getElementById('header');
    if (!el) return;

    var html = '';
    html += '<div class="header-bar">';

    // Left: logo + hamburger + title
    html += '<div class="header-left">';
    html += '<div class="header-logo">';
    html += '<div class="header-logo-icon"><span class="material-icons-outlined" style="font-size:18px">science</span></div>';
    html += '<div class="header-logo-text">VICO<small>SCIENCE</small></div>';
    html += '</div>';
    html += '<button class="header-hamburger" id="header-hamburger" title="Toggle sidebar"><span class="material-icons-outlined">menu</span></button>';
    html += '<h1 class="header-title">' + esc(title || '') + '</h1>';
    html += '</div>';

    // Right: notification + logout
    html += '<div class="header-right">';
    html += '<button class="header-bell" title="Thông báo"><span class="material-icons-outlined">notifications</span></button>';
    html += '<button class="header-logout" id="header-logout"><span class="material-icons-outlined" style="font-size:18px;margin-right:4px">power_settings_new</span>Đăng xuất</button>';
    html += '</div>';

    html += '</div>';

    el.innerHTML = html;

    // Hamburger toggle
    var hamburger = document.getElementById('header-hamburger');
    if (hamburger) {
      hamburger.addEventListener('click', function () {
        var sidebar = document.getElementById('sidebar');
        if (sidebar) {
          sidebar.classList.toggle('sidebar--collapsed');
        }
      });
    }
  }

  // ── Footer ─────────────────────────────────────────────────────────

  /**
   * Render the footer into the element with id="footer".
   */
  function renderFooter() {
    var el = document.getElementById('footer');
    if (!el) return;

    el.innerHTML =
      '<div class="footer-bar">' +
      '<span class="footer-text">&copy; Copyright 2023 - NAVIS VIETNAM MANUFACTURING CO., LTD</span>' +
      '</div>';
  }

  // ── Modal Utilities ────────────────────────────────────────────────

  /**
   * Show a modal by its id.
   * @param {string} modalId
   */
  function openModal(modalId) {
    var modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('modal--visible');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('body--modal-open');

    // Close on backdrop click
    modal.addEventListener('click', function handler(e) {
      if (e.target === modal) {
        closeModal(modalId);
        modal.removeEventListener('click', handler);
      }
    });
  }

  /**
   * Hide a modal by its id.
   * @param {string} modalId
   */
  function closeModal(modalId) {
    var modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('modal--visible');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('body--modal-open');
  }

  // ── Sub-menu Toggle ────────────────────────────────────────────────

  /**
   * Expand or collapse a sidebar sub-menu by its id.
   * @param {string} menuId - the id of the <ul> sub-menu element
   */
  function toggleSubMenu(menuId) {
    var submenu = document.getElementById(menuId);
    if (!submenu) return;

    var isExpanded = submenu.classList.contains('sidebar-submenu--expanded');
    submenu.classList.toggle('sidebar-submenu--expanded');

    // Update arrow indicator
    var toggle = document.querySelector('[data-submenu="' + menuId + '"]');
    if (toggle) {
      var arrow = toggle.querySelector('.sidebar-menu-arrow');
      if (arrow) {
        arrow.innerHTML = isExpanded ? '&#9654;' : '&#9660;';
      }
    }
  }

  // ── Page Initialisation ────────────────────────────────────────────

  /**
   * Initialise a wireframe page: render sidebar, header, footer, and
   * attach common event listeners.
   * @param {string} activeMenu - filename that should be highlighted in the sidebar
   * @param {string} title      - page title for the header bar
   */
  function initPage(activeMenu, title) {
    renderSidebar(activeMenu);
    renderHeader(title);
    renderFooter();

    // Close modals on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.keyCode === 27) {
        var visibleModals = document.querySelectorAll('.modal--visible');
        for (var i = 0; i < visibleModals.length; i++) {
          closeModal(visibleModals[i].id);
        }
      }
    });

    // Wire up any element with data-close-modal attribute
    document.addEventListener('click', function (e) {
      var closeBtn = e.target.closest('[data-close-modal]');
      if (closeBtn) {
        var targetId = closeBtn.getAttribute('data-close-modal');
        closeModal(targetId);
      }

      var openBtn = e.target.closest('[data-open-modal]');
      if (openBtn) {
        var targetId = openBtn.getAttribute('data-open-modal');
        openModal(targetId);
      }
    });
  }

  // ── Public API ─────────────────────────────────────────────────────

  window.NavisERP = {
    renderSidebar: renderSidebar,
    renderHeader: renderHeader,
    renderFooter: renderFooter,
    openModal: openModal,
    closeModal: closeModal,
    toggleSubMenu: toggleSubMenu,
    initPage: initPage
  };

  // Also expose top-level convenience functions so pages can call them
  // without the NavisERP namespace prefix.
  window.renderSidebar = renderSidebar;
  window.renderHeader = renderHeader;
  window.renderFooter = renderFooter;
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.toggleSubMenu = toggleSubMenu;
  window.initPage = initPage;

})(window);
