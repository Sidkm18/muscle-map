(function () {
  const social = window.MuscleMapSocial;

  if (!social) {
    return;
  }

  const avatar = document.getElementById('social-profile-avatar');
  const name = document.getElementById('social-profile-name');
  const handle = document.getElementById('social-profile-handle');
  const bio = document.getElementById('social-profile-bio');
  const chips = document.getElementById('social-profile-chips');
  const visibility = document.getElementById('social-profile-visibility');
  const postCount = document.getElementById('social-profile-post-count');
  const followerCount = document.getElementById('social-profile-follower-count');
  const followingCount = document.getElementById('social-profile-following-count');
  const photoCount = document.getElementById('social-profile-photo-count');
  const backLink = document.getElementById('social-profile-back');
  const followButton = document.getElementById('social-profile-follow');
  const privacyButton = document.getElementById('social-profile-privacy');
  const privateNote = document.getElementById('social-profile-private-note');
  const filterRow = document.getElementById('profile-filter-row');
  const lockState = document.getElementById('social-profile-lock-state');
  const postsRoot = document.getElementById('social-profile-posts');
  const summaryRoot = document.getElementById('social-profile-summary');
  const followersRoot = document.getElementById('social-profile-followers');
  const followingRoot = document.getElementById('social-profile-following');

  if (!avatar || !name || !postsRoot) {
    return;
  }

  const searchParams = new URLSearchParams(window.location.search);
  let profileId = searchParams.get('user') || social.currentUserId;
  let currentFilter = 'all';
  const openComments = {};

  function currentProfile() {
    const profile = social.getProfile(profileId);
    if (profile) {
      return profile;
    }

    profileId = social.currentUserId;
    return social.getProfile(profileId);
  }

  function renderProfileHeader(profile) {
    avatar.src = profile.avatar;
    name.textContent = profile.name;
    handle.textContent = '@' + profile.handle;
    bio.textContent = profile.bio;
    visibility.textContent = profile.private ? 'Private Profile' : 'Public Profile';
    chips.innerHTML = profile.tags.map(function (tag) {
      return '<span class="chip">' + social.escapeHtml(tag) + '</span>';
    }).join('');

    const profilePosts = social.getProfilePosts(profile.id, 'all');
    postCount.textContent = social.formatCount(profilePosts.length);
    followerCount.textContent = social.formatCount(profile.followersCount);
    followingCount.textContent = social.formatCount(profile.followingCount);
    photoCount.textContent = social.formatCount(profilePosts.filter(function (post) {
      return post.type === 'photo';
    }).length);

    backLink.href = social.postsUrl();
    followButton.hidden = profile.isCurrentUser;
    privacyButton.hidden = !profile.isCurrentUser;

    if (!profile.isCurrentUser) {
      followButton.textContent = profile.isFollowed ? 'Following' : (profile.private ? 'Request Follow' : 'Follow');
      followButton.classList.toggle('button-primary', !profile.isFollowed);
      followButton.classList.toggle('button-outline', profile.isFollowed);
      followButton.setAttribute('data-follow-profile', profile.id);
    }

    if (profile.isCurrentUser) {
      privacyButton.textContent = profile.private ? 'Make Profile Public' : 'Make Profile Private';
    }

    privateNote.hidden = !(profile.private && profile.isCurrentUser);
    privateNote.innerHTML = profile.private
      ? `
        <h2 class="page-title social-card-title">Private Mode Is On</h2>
        <p class="muted">Your full timeline still appears here, but anyone who does not follow you will see a locked state instead of your posts.</p>
      `
      : '';
  }

  function renderSummary(profile) {
    summaryRoot.innerHTML = `
      <div class="social-summary-row">
        <span class="mini-label">Location</span>
        <strong>${social.escapeHtml(profile.location)}</strong>
      </div>
      <div class="social-summary-row">
        <span class="mini-label">Focus</span>
        <strong>${social.escapeHtml(profile.focus)}</strong>
      </div>
      <div class="social-summary-row">
        <span class="mini-label">Headline</span>
        <strong>${social.escapeHtml(profile.headline)}</strong>
      </div>
      <div class="social-summary-row">
        <span class="mini-label">Visibility</span>
        <strong>${profile.private ? 'Private' : 'Public'}</strong>
      </div>
    `;
  }

  function renderUserRow(user, actionLabel) {
    return `
      <article class="social-user-row-card">
        <a class="social-user-link" href="${social.profileUrl(user.id)}">
          <img class="social-avatar-small" src="${user.avatar}" alt="${social.escapeHtml(user.name)} avatar" />
          <div>
            <div class="social-person-name">${social.escapeHtml(user.name)}</div>
            <div class="social-person-handle">@${social.escapeHtml(user.handle)}</div>
          </div>
        </a>
        ${actionLabel ? '<span class="social-status-pill">' + social.escapeHtml(actionLabel) + '</span>' : ''}
      </article>
    `;
  }

  function renderFollowers(profile) {
    followersRoot.innerHTML = profile.followers.length
      ? profile.followers.map(function (user) {
        return renderUserRow(user, user.verified ? 'Verified' : '');
      }).join('')
      : '<p class="muted">No followers yet.</p>';

    followingRoot.innerHTML = profile.following.length
      ? profile.following.map(function (user) {
        return renderUserRow(user, user.private ? 'Private' : '');
      }).join('')
      : '<p class="muted">Not following anyone yet.</p>';
  }

  function renderComment(comment) {
    return `
      <article class="social-comment">
        <img class="social-avatar-tiny" src="${comment.authorAvatar}" alt="${social.escapeHtml(comment.authorName)} avatar" />
        <div class="social-comment-body">
          <div class="social-inline-meta">
            <strong>${social.escapeHtml(comment.authorName)}</strong>
            <span class="social-person-handle">@${social.escapeHtml(comment.authorHandle)}</span>
            <span class="mini-label">${social.escapeHtml(comment.timeLabel)}</span>
          </div>
          <p class="muted social-comment-copy">${social.formatMultilineText(comment.message)}</p>
        </div>
      </article>
    `;
  }

  function renderPost(post) {
    const commentsAreOpen = Boolean(openComments[post.id]);

    return `
      <article class="glass-card card social-post-card">
        <div class="social-post-head">
          <div class="social-user-link">
            <img class="social-avatar" src="${post.author.avatar}" alt="${social.escapeHtml(post.author.name)} avatar" />
            <div>
              <div class="social-inline-meta">
                <strong class="social-person-name">${social.escapeHtml(post.author.name)}</strong>
                ${post.author.verified ? '<span class="social-status-pill social-status-verified">Verified</span>' : ''}
                <span class="social-status-pill">${post.type === 'photo' ? 'Photo Post' : 'Text Update'}</span>
              </div>
              <div class="social-person-handle">@${social.escapeHtml(post.author.handle)} · ${social.escapeHtml(post.timeLabel)}</div>
              <div class="mini-label">${social.escapeHtml(post.location)}</div>
            </div>
          </div>
        </div>

        <p class="social-post-copy">${social.formatMultilineText(post.message)}</p>
        ${post.imageUrl ? `<img class="social-post-image" src="${post.imageUrl}" alt="Post by ${social.escapeHtml(post.author.name)}" />` : ''}

        <div class="social-post-actions">
          <button class="pill social-action-btn ${post.isLiked ? 'active' : ''}" type="button" data-like-post="${post.id}">Like ${social.formatCount(post.likes)}</button>
          <button class="pill social-action-btn ${commentsAreOpen ? 'active' : ''}" type="button" data-toggle-comments="${post.id}">Comments ${post.comments.length}</button>
        </div>

        <div class="social-comments${commentsAreOpen ? ' open' : ''}">
          <div class="social-comment-list">
            ${post.comments.length ? post.comments.map(renderComment).join('') : '<p class="social-empty-copy">No comments yet. Start the thread.</p>'}
          </div>
          <form class="social-comment-form" data-comment-form="${post.id}">
            <input type="text" name="comment" maxlength="220" placeholder="Write a comment..." />
            <button class="button button-outline" type="submit">Reply</button>
          </form>
        </div>
      </article>
    `;
  }

  function renderPosts(profile) {
    const canView = social.canViewProfile(profile.id);

    filterRow.querySelectorAll('[data-profile-filter]').forEach(function (button) {
      button.classList.toggle('active', button.getAttribute('data-profile-filter') === currentFilter);
    });

    if (!canView) {
      lockState.hidden = false;
      lockState.innerHTML = `
        <h2 class="page-title social-card-title">This Profile Is Private</h2>
        <p class="muted">Follow ${social.escapeHtml(profile.name)} to unlock their timeline, image posts, and the full comment activity.</p>
      `;
      postsRoot.innerHTML = '';
      return;
    }

    lockState.hidden = true;
    lockState.innerHTML = '';

    const posts = social.getProfilePosts(profile.id, currentFilter);
    postsRoot.innerHTML = posts.length
      ? posts.map(renderPost).join('')
      : '<article class="glass-card card"><p class="muted">No posts match this profile filter yet.</p></article>';
  }

  function render() {
    const profile = currentProfile();
    renderProfileHeader(profile);
    renderSummary(profile);
    renderFollowers(profile);
    renderPosts(profile);
  }

  filterRow.addEventListener('click', function (event) {
    const button = event.target.closest('[data-profile-filter]');
    if (!button) {
      return;
    }

    currentFilter = button.getAttribute('data-profile-filter') || 'all';
    render();
  });

  followButton.addEventListener('click', function () {
    const profile = currentProfile();
    if (profile.isCurrentUser) {
      return;
    }

    social.toggleFollow(profile.id);
    render();
  });

  privacyButton.addEventListener('click', function () {
    const profile = currentProfile();
    if (!profile.isCurrentUser) {
      return;
    }

    const nextValue = !profile.private;
    social.setPrivacy(profile.id, nextValue);
    render();
    window.showToast && window.showToast(nextValue ? 'Profile switched to private.' : 'Profile switched to public.', 'success');
  });

  document.addEventListener('click', function (event) {
    const likeButton = event.target.closest('[data-like-post]');
    const commentButton = event.target.closest('[data-toggle-comments]');

    if (likeButton) {
      social.toggleLike(likeButton.getAttribute('data-like-post'));
      render();
      return;
    }

    if (commentButton) {
      const postId = commentButton.getAttribute('data-toggle-comments');
      openComments[postId] = !openComments[postId];
      render();
    }
  });

  postsRoot.addEventListener('submit', function (event) {
    const form = event.target.closest('[data-comment-form]');
    if (!form) {
      return;
    }

    event.preventDefault();
    const postId = form.getAttribute('data-comment-form');
    const input = form.querySelector('input[name="comment"]');
    const value = input ? input.value.trim() : '';

    if (!value) {
      window.showToast && window.showToast('Write a comment before replying.', 'error');
      return;
    }

    social.addComment(postId, value);
    openComments[postId] = true;
    render();
    window.showToast && window.showToast('Comment added.', 'success');
  });

  render();
})();
