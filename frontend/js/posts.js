(function () {
  const social = window.MuscleMapSocial;

  if (!social) {
    return;
  }

  const composerForm = document.getElementById('post-composer');
  const composerMessage = document.getElementById('compose-message');
  const composerImage = document.getElementById('compose-image');
  const composerImageWrap = document.getElementById('compose-image-wrap');
  const composeCount = document.getElementById('compose-count');
  const composeSubmit = document.getElementById('compose-submit');
  const composeModeRow = document.getElementById('compose-mode-row');
  const feedFilterRow = document.getElementById('feed-filter-row');
  const feedRoot = document.getElementById('posts-feed');
  const viewerCard = document.getElementById('viewer-card');
  const suggestedCreators = document.getElementById('suggested-creators');
  const composerProfileLink = document.getElementById('composer-profile-link');
  const feedPostTotal = document.getElementById('feed-post-total');
  const feedFollowTotal = document.getElementById('feed-follow-total');
  const feedLikeTotal = document.getElementById('feed-like-total');

  if (!composerForm || !composerMessage || !feedRoot) {
    return;
  }

  let composeMode = 'text';
  let currentFilter = 'all';
  const openComments = {};

  function updateComposeMode() {
    composeModeRow.querySelectorAll('[data-compose-mode]').forEach(function (button) {
      button.classList.toggle('active', button.getAttribute('data-compose-mode') === composeMode);
    });

    composerImageWrap.hidden = composeMode !== 'photo';
    composeSubmit.textContent = composeMode === 'photo' ? 'Share Photo Post' : 'Share Update';

    if (composerProfileLink) {
      composerProfileLink.href = social.profileUrl(social.currentUserId);
    }
  }

  function updateComposeCount() {
    composeCount.textContent = String(composerMessage.value.length);
  }

  function renderViewerCard() {
    const currentUser = social.getCurrentUser();

    viewerCard.innerHTML = `
      <div class="social-card-header">
        <div>
          <h2 class="page-title social-card-title">Your Community Snapshot</h2>
          <p class="muted">One card that ties your posts page to your social profile page.</p>
        </div>
      </div>
      <div class="social-profile-mini">
        <img class="social-avatar" src="${currentUser.avatar}" alt="${social.escapeHtml(currentUser.name)} avatar" />
        <div>
          <div class="social-person-name">${social.escapeHtml(currentUser.name)}</div>
          <div class="social-person-handle">@${social.escapeHtml(currentUser.handle)}</div>
        </div>
      </div>
      <div class="social-inline-stats social-inline-stats-compact">
        <div>
          <div class="metric-value">${social.formatCount(currentUser.followersCount)}</div>
          <div class="mini-label">Followers</div>
        </div>
        <div>
          <div class="metric-value">${social.formatCount(currentUser.followingCount)}</div>
          <div class="mini-label">Following</div>
        </div>
      </div>
      <p class="muted">${social.escapeHtml(currentUser.bio)}</p>
      <a class="button button-outline" href="${social.profileUrl(currentUser.id)}">Open Social Profile</a>
    `;
  }

  function renderSuggestedCreators() {
    const creators = social.getSuggestedAuthors(3);

    if (!creators.length) {
      suggestedCreators.innerHTML = '<p class="muted">You are already following everyone in this demo feed.</p>';
      return;
    }

    suggestedCreators.innerHTML = creators.map(function (author) {
      return `
        <article class="social-user-row-card">
          <a class="social-user-link" href="${social.profileUrl(author.id)}">
            <img class="social-avatar-small" src="${author.avatar}" alt="${social.escapeHtml(author.name)} avatar" />
            <div>
              <div class="social-person-name">${social.escapeHtml(author.name)}</div>
              <div class="social-person-handle">@${social.escapeHtml(author.handle)}</div>
            </div>
          </a>
          <button class="button button-outline social-compact-button" type="button" data-follow-author="${author.id}">${author.private ? 'Request' : 'Follow'}</button>
        </article>
      `;
    }).join('');
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
    const followButton = post.author.isCurrentUser
      ? ''
      : `<button class="button ${post.author.isFollowed ? 'button-outline' : 'button-primary'} social-compact-button" type="button" data-follow-author="${post.author.id}">${post.author.isFollowed ? 'Following' : (post.author.private ? 'Request Follow' : 'Follow')}</button>`;

    return `
      <article class="glass-card card social-post-card">
        <div class="social-post-head">
          <a class="social-user-link" href="${social.profileUrl(post.author.id)}">
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
          </a>
          ${followButton}
        </div>

        <p class="social-post-copy">${social.formatMultilineText(post.message)}</p>
        ${post.imageUrl ? `<img class="social-post-image" src="${post.imageUrl}" alt="Post by ${social.escapeHtml(post.author.name)}" />` : ''}

        <div class="social-post-actions">
          <button class="pill social-action-btn ${post.isLiked ? 'active' : ''}" type="button" data-like-post="${post.id}">Like ${social.formatCount(post.likes)}</button>
          <button class="pill social-action-btn ${commentsAreOpen ? 'active' : ''}" type="button" data-toggle-comments="${post.id}">Comments ${post.comments.length}</button>
          <a class="pill social-action-btn" href="${social.profileUrl(post.author.id)}">View Profile</a>
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

  function renderFeed() {
    const posts = social.getFeedPosts(currentFilter);
    const currentUser = social.getCurrentUser();

    feedRoot.innerHTML = posts.length
      ? posts.map(renderPost).join('')
      : '<article class="glass-card card"><p class="muted">No posts match the selected feed filter right now.</p></article>';

    feedFilterRow.querySelectorAll('[data-feed-filter]').forEach(function (button) {
      button.classList.toggle('active', button.getAttribute('data-feed-filter') === currentFilter);
    });

    feedPostTotal.textContent = social.formatCount(posts.length);
    feedFollowTotal.textContent = social.formatCount(currentUser.followingCount);
    feedLikeTotal.textContent = social.formatCount(social.getFeedPosts('all').filter(function (post) {
      return post.isLiked;
    }).length);
  }

  function rerender() {
    renderViewerCard();
    renderSuggestedCreators();
    renderFeed();
  }

  composeModeRow.addEventListener('click', function (event) {
    const button = event.target.closest('[data-compose-mode]');
    if (!button) {
      return;
    }

    composeMode = button.getAttribute('data-compose-mode') || 'text';
    updateComposeMode();
  });

  feedFilterRow.addEventListener('click', function (event) {
    const button = event.target.closest('[data-feed-filter]');
    if (!button) {
      return;
    }

    currentFilter = button.getAttribute('data-feed-filter') || 'all';
    rerender();
  });

  composerMessage.addEventListener('input', updateComposeCount);

  composerForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const message = composerMessage.value.trim();
    const imageUrl = composeMode === 'photo' ? composerImage.value.trim() : '';

    if (!message) {
      window.showToast && window.showToast('Write a message before posting.', 'error');
      return;
    }

    if (composeMode === 'photo' && !imageUrl) {
      window.showToast && window.showToast('Add an image URL for a photo post.', 'error');
      return;
    }

    try {
      social.addPost({
        message: message,
        imageUrl: imageUrl
      });
      composerForm.reset();
      composeMode = 'text';
      updateComposeMode();
      updateComposeCount();
      rerender();
      window.showToast && window.showToast('Post published to the feed.', 'success');
    } catch (error) {
      window.showToast && window.showToast(error.message || 'Unable to publish post.', 'error');
    }
  });

  document.addEventListener('click', function (event) {
    const likeButton = event.target.closest('[data-like-post]');
    const commentButton = event.target.closest('[data-toggle-comments]');
    const followButton = event.target.closest('[data-follow-author]');

    if (likeButton) {
      social.toggleLike(likeButton.getAttribute('data-like-post'));
      rerender();
      return;
    }

    if (commentButton) {
      const postId = commentButton.getAttribute('data-toggle-comments');
      openComments[postId] = !openComments[postId];
      rerender();
      return;
    }

    if (followButton) {
      social.toggleFollow(followButton.getAttribute('data-follow-author'));
      rerender();
    }
  });

  feedRoot.addEventListener('submit', function (event) {
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
    rerender();
    window.showToast && window.showToast('Comment added.', 'success');
  });

  updateComposeMode();
  updateComposeCount();
  rerender();
})();
