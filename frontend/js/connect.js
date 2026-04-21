(function () {
  const app = window.MuscleMap || {};
  const connectMain = document.getElementById('connect-page-main');
  const connectGrid = document.getElementById('connect-athletes-grid');
  const exploreButton = document.getElementById('connect-explore-button');
  const suggestedSection = document.getElementById('connect-suggested-section');
  const welcomeName = document.getElementById('connect-welcome-name');
  const followState = {};
  let openMenuId = null;
  const suggestedAthletes = [
    {
      id: 1,
      username: 'sidkm',
      profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
      tag: 'Bodybuilder',
      followers: '12.4k followers',
      status: 'Active today'
    },
    {
      id: 2,
      username: 'strongwsoham',
      profileImage: 'https://randomuser.me/api/portraits/men/45.jpg',
      tag: 'Strength Coach',
      followers: '8.1k followers',
      status: 'On a 5-day streak'
    },
    {
      id: 3,
      username: 'fitwithkadhe',
      profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
      tag: 'Trainer',
      followers: '15.7k followers',
      status: 'Workout completed'
    },
    {
      id: 4,
      username: 'yogawithmia',
      profileImage: 'https://randomuser.me/api/portraits/women/68.jpg',
      tag: 'Yoga Expert',
      followers: '25k followers',
      status: 'Rest day'
    },
    {
      id: 5,
      username: 'cardiotickanase',
      profileImage: 'https://randomuser.me/api/portraits/men/51.jpg',
      tag: 'Runner',
      followers: '6.8k followers',
      status: 'Active today'
    },
    {
      id: 6,
      username: 'ironaryan',
      profileImage: 'https://randomuser.me/api/portraits/men/71.jpg',
      tag: 'Powerlifter',
      followers: '18.3k followers',
      status: 'On a 3-day streak'
    },
    {
      id: 7,
      username: 'mobilitymeher',
      profileImage: 'https://randomuser.me/api/portraits/women/22.jpg',
      tag: 'Mobility Coach',
      followers: '9.6k followers',
      status: 'Workout completed'
    },
    {
      id: 8,
      username: 'corewithnina',
      profileImage: 'https://randomuser.me/api/portraits/women/57.jpg',
      tag: 'Pilates Coach',
      followers: '11.2k followers',
      status: 'Rest day'
    }
  ];

  if (!connectMain || !connectGrid) {
    return;
  }

  if (window.localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.replace('./login.html');
    return;
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderWelcomeName();
    renderSuggestedAthletes();
    bindActions();

    if (typeof app.requestJson !== 'function') {
      connectMain.hidden = false;
      return;
    }

    app.requestJson('profile')
      .then(function (data) {
        renderWelcomeName(data && data.user ? data.user : null);
        connectMain.hidden = false;
      })
      .catch(function (error) {
        if (error && error.status === 401) {
          window.localStorage.removeItem('isLoggedIn');
          window.localStorage.removeItem('userId');
          window.localStorage.removeItem('userEmail');
          window.localStorage.removeItem('userName');
          window.location.replace('./login.html');
          return;
        }

        connectMain.hidden = false;
        if (typeof window.showToast === 'function') {
          window.showToast(error && error.message ? error.message : 'Unable to verify login session.', 'error');
        }
      });
  });

  function bindActions() {
    if (exploreButton && suggestedSection) {
      exploreButton.addEventListener('click', function () {
        suggestedSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      });
    }

    connectGrid.addEventListener('click', function (event) {
      const followButton = event.target.closest('[data-follow-id]');
      const menuActionButton = event.target.closest('[data-follow-action]');

      if (menuActionButton) {
        handleFollowMenuAction(menuActionButton);
        return;
      }

      if (!followButton) {
        return;
      }

      const athleteId = String(followButton.getAttribute('data-follow-id') || '');

      if (!athleteId) {
        return;
      }

      if (!followState[athleteId]) {
        followState[athleteId] = true;
        openMenuId = null;
        renderSuggestedAthletes();
        return;
      }

      openMenuId = openMenuId === athleteId ? null : athleteId;
      renderSuggestedAthletes();
    });

    document.addEventListener('click', function (event) {
      if (!openMenuId) {
        return;
      }

      if (event.target.closest('.connect-athlete-actions')) {
        return;
      }

      openMenuId = null;
      renderSuggestedAthletes();
    });
  }

  function renderWelcomeName(user) {
    if (!welcomeName) {
      return;
    }

    const resolvedName = resolveWelcomeName(user);
    welcomeName.textContent = 'Hey ' + resolvedName;
  }

  function resolveWelcomeName(user) {
    const profileUser = user || {};
    const displayName = String(profileUser.full_name || profileUser.username || '').trim();
    const storedName = String(window.localStorage.getItem('userName') || '').trim();
    const storedId = String(window.localStorage.getItem('userId') || '').trim();

    if (displayName) {
      return displayName;
    }

    if (storedName) {
      return storedName;
    }

    if (storedId) {
      return 'User ' + storedId;
    }

    return 'Athlete';
  }

  function renderSuggestedAthletes() {
    connectGrid.innerHTML = suggestedAthletes.map(function (user) {
      const isFollowing = Boolean(followState[String(user.id)]);
      const isActiveToday = /active today/i.test(user.status);
      const isMenuOpen = openMenuId === String(user.id);
      return (
        '<article class="glass-card card connect-athlete-card' + (isMenuOpen ? ' has-open-menu' : '') + '" data-athlete-id="' + user.id + '">' +
          '<div class="connect-athlete-top">' +
            '<div class="connect-athlete-avatar-wrap">' +
              '<img class="connect-athlete-avatar" src="' + user.profileImage + '" alt="' + user.username + ' profile photo" loading="lazy" decoding="async" width="72" height="72" />' +
              (isActiveToday ? '<span class="connect-athlete-active-dot" aria-label="Active today"></span>' : '') +
            '</div>' +
            '<span class="connect-athlete-badge">Suggested</span>' +
          '</div>' +
          '<div class="connect-athlete-copy">' +
            '<h3 class="connect-athlete-name">' + escapeHtml(user.username) + '</h3>' +
            '<p class="connect-athlete-tag">' + escapeHtml(user.tag) + '</p>' +
            '<p class="connect-athlete-followers">' + renderIcon('followers') + '<span>' + escapeHtml(user.followers) + '</span></p>' +
            '<p class="connect-athlete-status">' + renderStatusIcon(user.status) + '<span>' + escapeHtml(user.status) + '</span></p>' +
            '<div class="connect-athlete-actions">' +
              '<button class="button ' + (isFollowing ? 'button-outline' : 'button-primary') + ' connect-follow-button' +
                (isFollowing ? ' is-following' : '') + '" type="button" data-follow-id="' + user.id + '">' +
                (isFollowing ? 'Following' : 'Follow') +
              '</button>' +
              (isFollowing && isMenuOpen ? renderFollowMenu(user) : '') +
            '</div>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  function handleFollowMenuAction(button) {
    const athleteId = String(button.getAttribute('data-follow-id') || '');
    const action = String(button.getAttribute('data-follow-action') || '');
    const athlete = suggestedAthletes.find(function (user) {
      return String(user.id) === athleteId;
    });

    if (!athleteId || !action || !athlete) {
      return;
    }

    if (action === 'unfollow') {
      followState[athleteId] = false;
      openMenuId = null;
      renderSuggestedAthletes();
      if (typeof window.showToast === 'function') {
        window.showToast('Unfollowed ' + athlete.username + '.', 'success');
      }
      return;
    }

    if (action === 'copy') {
      copyProfileUrl(athlete);
      openMenuId = null;
      renderSuggestedAthletes();
      return;
    }

    openMenuId = null;
    renderSuggestedAthletes();
    if (typeof window.showToast === 'function') {
      if (action === 'favourite') {
        window.showToast(athlete.username + ' added to favourites.', 'success');
      } else if (action === 'mute') {
        window.showToast(athlete.username + ' has been muted.', 'success');
      } else if (action === 'restrict') {
        window.showToast(athlete.username + ' has been restricted.', 'success');
      }
    }
  }

  function renderFollowMenu(user) {
    return (
      '<div class="connect-follow-menu" role="menu" aria-label="Profile actions for ' + escapeHtml(user.username) + '">' +
        renderFollowMenuButton(user.id, 'unfollow', 'Unfollow', 'unfollow') +
        renderFollowMenuButton(user.id, 'favourite', 'Add to Favourites', 'favourite') +
        renderFollowMenuButton(user.id, 'mute', 'Mute', 'mute') +
        renderFollowMenuButton(user.id, 'restrict', 'Restrict', 'restrict') +
        renderFollowMenuButton(user.id, 'copy', 'Copy Profile URL', 'copy') +
      '</div>'
    );
  }

  function renderFollowMenuButton(id, action, label, iconType) {
    return (
      '<button class="connect-follow-menu-item' + (action === 'unfollow' ? ' is-danger' : '') + '" type="button" role="menuitem" data-follow-id="' + id + '" data-follow-action="' + action + '">' +
        '<span class="connect-follow-menu-icon">' + renderMenuIcon(iconType) + '</span>' +
        '<span class="connect-follow-menu-label">' + label + '</span>' +
      '</button>'
    );
  }

  function copyProfileUrl(user) {
    const profileUrl = window.location.origin + window.location.pathname.replace(/\/pages\/connect\.html$/i, '/connect/' + user.username).replace(/\/connect\/index\.html$/i, '/connect/' + user.username);

    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(profileUrl)
        .then(function () {
          if (typeof window.showToast === 'function') {
            window.showToast('Profile URL copied.', 'success');
          }
        })
        .catch(function () {
          fallbackCopy(profileUrl);
        });
      return;
    }

    fallbackCopy(profileUrl);
  }

  function fallbackCopy(value) {
    const input = document.createElement('input');
    input.value = value;
    document.body.appendChild(input);
    input.select();

    try {
      document.execCommand('copy');
      if (typeof window.showToast === 'function') {
        window.showToast('Profile URL copied.', 'success');
      }
    } catch (error) {
      if (typeof window.showToast === 'function') {
        window.showToast('Unable to copy profile URL.', 'error');
      }
    }

    document.body.removeChild(input);
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function renderStatusIcon(status) {
    const normalizedStatus = String(status || '').toLowerCase();

    if (normalizedStatus.includes('streak')) {
      return renderIcon('streak');
    }

    if (normalizedStatus.includes('workout completed')) {
      return renderIcon('completed');
    }

    if (normalizedStatus.includes('rest day')) {
      return renderIcon('rest');
    }

    return renderIcon('active');
  }

  function renderIcon(type) {
    const icons = {
      followers:
        '<svg class="connect-inline-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">' +
          '<path d="M7 10.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4Zm6.1-.7a2.6 2.6 0 1 1 0-5.2 2.6 2.6 0 0 1 0 5.2ZM2.9 15.8c0-2.1 2.2-3.6 4.8-3.6s4.8 1.5 4.8 3.6v.4H2.9v-.4Zm10-.1c.1-1.4 1.6-2.6 3.6-2.6 1 0 1.9.2 2.6.7.4.3.7.7.7 1.2v1.2h-6.9v-.5Z" fill="currentColor"/>' +
        '</svg>',
      streak:
        '<svg class="connect-inline-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">' +
          '<path d="M11.4 1.9c.2 2-.7 3.1-1.8 4.2-1 1.1-2.1 2.2-2.1 4.1 0 1.2.6 2.4 1.5 3.1-.1-.5-.1-1 .1-1.6.4-1.3 1.6-2.1 2.6-2.9 1.2-.9 2.2-1.8 2.4-3.6 1.5 1.2 2.5 3.1 2.5 5.2 0 3.8-2.9 6.5-6.7 6.5-3.8 0-6.4-2.9-6.4-6.4 0-3.9 2.8-5.8 4.7-7.9.9-1 1.6-2 1.8-3.7.5.5 1.2 1.4 1.4 3Z" fill="currentColor"/>' +
        '</svg>',
      completed:
        '<svg class="connect-inline-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">' +
          '<path d="M10 1.8a8.2 8.2 0 1 1 0 16.4 8.2 8.2 0 0 1 0-16.4Zm3.5 5.3-4.2 4.6-2.6-2.3-1.1 1.2 3.8 3.5 5.3-5.8-1.2-1.2Z" fill="currentColor"/>' +
        '</svg>',
      rest:
        '<svg class="connect-inline-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">' +
          '<path d="M13.7 2.4a6.8 6.8 0 1 0 3.9 11.9A7.4 7.4 0 0 1 13.7 2.4Z" fill="currentColor"/>' +
        '</svg>',
      active:
        '<svg class="connect-inline-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">' +
          '<circle cx="10" cy="10" r="5.4" fill="currentColor"/>' +
        '</svg>'
    };

    return icons[type] || '';
  }

  function renderMenuIcon(type) {
    const icons = {
      unfollow:
        '<svg class="connect-menu-inline-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">' +
          '<path d="M10 1.8a8.2 8.2 0 1 1 0 16.4 8.2 8.2 0 0 1 0-16.4Zm-3 7.4v1.6h6V9.2H7Z" fill="currentColor"/>' +
        '</svg>',
      favourite:
        '<svg class="connect-menu-inline-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">' +
          '<path d="m10 2.6 2.2 4.5 5 .7-3.6 3.5.9 4.9-4.5-2.4-4.5 2.4.9-4.9L2.8 7.8l5-.7L10 2.6Z" fill="currentColor"/>' +
        '</svg>',
      mute:
        '<svg class="connect-menu-inline-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">' +
          '<path d="M11.6 4.2 8.4 6.8H5.2v6.4h3.2l3.2 2.6V4.2Zm2.4 2.2 1.2 1.2a4.7 4.7 0 0 1 0 4.8L14 13.6a6.3 6.3 0 0 0 0-7.2Zm2.2-2.2 1.1 1.1a8 8 0 0 1 0 11.4l-1.1-1.1a6.5 6.5 0 0 0 0-9.2Z" fill="currentColor"/>' +
        '</svg>',
      restrict:
        '<svg class="connect-menu-inline-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">' +
          '<path d="M10 2.2 4.2 4.6v4.2c0 4 2.4 7 5.8 8.9 3.4-1.9 5.8-4.9 5.8-8.9V4.6L10 2.2Zm3 8.9H7V9.5h6V11Z" fill="currentColor"/>' +
        '</svg>',
      copy:
        '<svg class="connect-menu-inline-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">' +
          '<path d="M7 3.6h7.6a2 2 0 0 1 2 2v7.6h-1.8V5.6a.2.2 0 0 0-.2-.2H7V3.6Zm-3.6 3.2h7.8a2 2 0 0 1 2 2v7.8a2 2 0 0 1-2 2H3.4a2 2 0 0 1-2-2V8.8a2 2 0 0 1 2-2Zm0 1.8a.2.2 0 0 0-.2.2v7.8c0 .1.1.2.2.2h7.8c.1 0 .2-.1.2-.2V8.8a.2.2 0 0 0-.2-.2H3.4Z" fill="currentColor"/>' +
        '</svg>'
    };

    return icons[type] || '';
  }
}());
