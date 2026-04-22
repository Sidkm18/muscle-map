(function () {
  const app = window.MuscleMap || {};
  const connectMain = document.getElementById('connect-page-main');
  const connectGrid = document.getElementById('connect-athletes-grid');
  const connectPostsGrid = document.getElementById('connect-posts-grid');
  const createTrigger = document.getElementById('connect-create-trigger');
  const typeModalShell = document.getElementById('connect-type-modal-shell');
  const typeModalClose = document.getElementById('connect-type-modal-close');
  const createFlow = document.getElementById('connect-create-flow');
  const modalBackButton = document.getElementById('connect-modal-back');
  const modalNextButton = document.getElementById('connect-modal-next');
  const exploreButton = document.getElementById('connect-explore-button');
  const suggestedSection = document.getElementById('connect-suggested-section');
  const welcomeName = document.getElementById('connect-welcome-name');
  const followState = {};
  let openMenuId = null;
  let posts = [];
  let postsLoaded = false;
  let selectedType = 'post';
  let createStep = 'selectType';
  let selectedMediaFile = null;
  let selectedMediaPreview = '';
  let selectedMediaPersistent = '';
  let selectedMediaType = '';
  let draftCaption = '';
  let cropControlsOpen = false;
  let cropScale = 1;
  let cropX = 50;
  let cropY = 50;
  let cropRotation = 0;
  const demoPosts = [
    {
      id: 'demo-1',
      user: 'Atharv',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      type: 'post',
      mediaType: 'image',
      media: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
      persistentMedia: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
      caption: 'Leg day done',
      likes: 124,
      liked: false,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      crop: null
    },
    {
      id: 'demo-2',
      user: 'Rahul',
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
      type: 'reel',
      mediaType: 'image',
      media: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=900&q=80',
      persistentMedia: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=900&q=80',
      caption: 'Push workout pump',
      likes: 89,
      liked: false,
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      crop: null
    },
    {
      id: 'demo-3',
      user: 'Sneha',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      type: 'post',
      mediaType: 'image',
      media: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80',
      persistentMedia: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1200&q=80',
      caption: 'Consistency > motivation',
      likes: 201,
      liked: false,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      crop: null
    }
  ];
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

  if (!connectMain || !connectGrid || !connectPostsGrid) {
    return;
  }

  document.addEventListener('DOMContentLoaded', function () {
    if (typeof app.getSession === 'function') {
      app.getSession().then(function (session) {
        if (!session || !session.authenticated) {
          window.location.replace('./login.html');
          return;
        }

        renderPosts();
        renderWelcomeName(session.user || null);
        renderSuggestedAthletes();
        bindActions();
        connectMain.hidden = false;
        loadPosts();
      }).catch(function () {
        window.location.replace('./login.html');
      });
      return;
    }

    renderWelcomeName();
    renderPosts();
    renderSuggestedAthletes();
    bindActions();
    connectMain.hidden = false;
    loadPosts();
  });

  function bindActions() {
    if (createTrigger && typeModalShell) {
      createTrigger.addEventListener('click', openTypeModal);
    }

    if (typeModalClose) {
      typeModalClose.addEventListener('click', closeTypeModal);
    }

    if (modalBackButton) {
      modalBackButton.addEventListener('click', handleModalBack);
    }

    if (modalNextButton) {
      modalNextButton.addEventListener('click', handleModalNext);
    }

    if (typeModalShell) {
      typeModalShell.addEventListener('click', function (event) {
        const optionButton = event.target.closest('[data-connect-type]');
        const closeTarget = event.target.closest('[data-connect-modal-close]');
        const uploadInput = event.target.closest('#connect-upload-input');
        const toolButton = event.target.closest('[data-connect-upload-tool]');

        if (optionButton) {
          handleTypeSelection(optionButton);
          return;
        }

        if (toolButton) {
          handleUploadTool(toolButton);
          return;
        }

        if (closeTarget) {
          closeTypeModal();
        }
      });

      typeModalShell.addEventListener('change', function (event) {
        if (event.target && event.target.id === 'connect-upload-input') {
          handleUploadSelection(event.target);
        }
      });

      typeModalShell.addEventListener('input', function (event) {
        if (event.target && event.target.id === 'connect-caption-input') {
          draftCaption = String(event.target.value || '');
          return;
        }

        if (event.target && event.target.id === 'connect-crop-scale') {
          cropScale = Number(event.target.value || 1);
          renderCreateFlow();
          return;
        }

        if (event.target && event.target.id === 'connect-crop-x') {
          cropX = Number(event.target.value || 50);
          renderCreateFlow();
          return;
        }

        if (event.target && event.target.id === 'connect-crop-y') {
          cropY = Number(event.target.value || 50);
          renderCreateFlow();
        }
      });
    }

    if (exploreButton && suggestedSection) {
      exploreButton.addEventListener('click', function () {
        suggestedSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      });
    }

    connectPostsGrid.addEventListener('click', function (event) {
      const actionButton = event.target.closest('[data-post-action]');
      if (!actionButton) {
        return;
      }

      handlePostAction(actionButton);
    });

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

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && typeModalShell && !typeModalShell.hidden) {
        closeTypeModal();
      }
    });
  }

  function openTypeModal() {
    if (!typeModalShell) {
      return;
    }

    resetCreateFlow();
    typeModalShell.hidden = false;
    renderCreateFlow();
  }

  function closeTypeModal() {
    if (!typeModalShell) {
      return;
    }

    typeModalShell.hidden = true;
  }

  function handleTypeSelection(button) {
    const nextType = String(button.getAttribute('data-connect-type') || '').toLowerCase();
    if (!nextType) {
      return;
    }

    selectedType = nextType;
    createStep = 'upload';
    renderCreateFlow();

    if (typeof window.showToast === 'function') {
      window.showToast(capitalizeWord(selectedType) + ' selected.', 'success');
    }
  }

  function handleModalBack() {
    if (createStep === 'upload') {
      createStep = 'selectType';
      renderCreateFlow();
      return;
    }

    if (createStep === 'caption') {
      createStep = 'upload';
      renderCreateFlow();
    }
  }

  function handleModalNext() {
    if (createStep === 'upload') {
      if (!hasSelectedMedia()) {
        if (typeof window.showToast === 'function') {
          window.showToast('Upload an image or video first.', 'error');
        }
        return;
      }

      createStep = 'caption';
      renderCreateFlow();
      return;
    }

    if (createStep === 'caption') {
      publishDraftPost();
    }
  }

  function handleUploadSelection(input) {
    const nextFile = input.files && input.files[0] ? input.files[0] : null;
    if (!nextFile) {
      return;
    }

    if (selectedMediaPreview) {
      URL.revokeObjectURL(selectedMediaPreview);
    }

    selectedMediaFile = nextFile;
    selectedMediaType = nextFile.type && nextFile.type.startsWith('video/') ? 'video' : 'image';
    selectedMediaPreview = URL.createObjectURL(nextFile);
    selectedMediaPersistent = '';
    cropControlsOpen = false;
    cropScale = 1;
    cropX = 50;
    cropY = 50;
    cropRotation = 0;
    renderCreateFlow();

    readFileAsDataUrl(nextFile)
      .then(function (dataUrl) {
        selectedMediaPersistent = dataUrl;
        renderCreateFlow();
      })
      .catch(function () {
        if (typeof window.showToast === 'function') {
          window.showToast('Unable to read this file.', 'error');
        }
      });
  }

  function handleUploadTool(button) {
    const action = String(button.getAttribute('data-connect-upload-tool') || '');
    if (!action) {
      return;
    }

    if (action === 'remove') {
      clearSelectedMedia();
      renderCreateFlow();
      return;
    }

    if (action === 'crop') {
      if (selectedMediaType !== 'image' || !hasSelectedMedia()) {
        if (typeof window.showToast === 'function') {
          window.showToast('Crop is available for images after upload.', 'error');
        }
        return;
      }

      cropControlsOpen = !cropControlsOpen;
      renderCreateFlow();
      return;
    }

    if (action === 'rotate') {
      if (selectedMediaType !== 'image' || !hasSelectedMedia()) {
        if (typeof window.showToast === 'function') {
          window.showToast('Rotate is available for uploaded images.', 'error');
        }
        return;
      }

      cropRotation = (cropRotation + 90) % 360;
      renderCreateFlow();
    }
  }

  function renderCreateFlow() {
    if (!createFlow || !modalBackButton || !modalNextButton) {
      return;
    }

    if (createStep === 'upload') {
      createFlow.innerHTML = renderUploadStep();
      modalBackButton.hidden = false;
      modalNextButton.hidden = false;
      modalNextButton.textContent = 'Next';
      return;
    }

    if (createStep === 'caption') {
      createFlow.innerHTML = renderCaptionStep();
      modalBackButton.hidden = false;
      modalNextButton.hidden = false;
      modalNextButton.textContent = selectedType === 'story' ? 'Share Story' : 'Post';
      return;
    }

    createFlow.innerHTML = renderSelectTypeStep();
    modalBackButton.hidden = true;
    modalNextButton.hidden = true;
  }

  function renderSelectTypeStep() {
    return (
      '<div class="connect-type-options">' +
        '<button class="connect-type-option" type="button" data-connect-type="post">' +
          '<span class="connect-type-option-title">Post</span>' +
          '<span class="connect-type-option-copy">Share a workout image or update with your network.</span>' +
        '</button>' +
        '<button class="connect-type-option" type="button" data-connect-type="reel">' +
          '<span class="connect-type-option-title">Reel</span>' +
          '<span class="connect-type-option-copy">Upload a quick video clip with motion-first energy.</span>' +
        '</button>' +
        '<button class="connect-type-option" type="button" data-connect-type="story">' +
          '<span class="connect-type-option-title">Story</span>' +
          '<span class="connect-type-option-copy">Post a short-lived snapshot for the day.</span>' +
        '</button>' +
      '</div>'
    );
  }

  function renderUploadStep() {
    return (
      '<div class="connect-upload-stage">' +
        '<label class="connect-upload-field">' +
          '<span class="mini-label">Upload ' + escapeHtml(capitalizeWord(selectedType)) + '</span>' +
          '<input id="connect-upload-input" class="connect-upload-input" type="file" accept="image/*,video/*" />' +
        '</label>' +
        '<div class="connect-upload-preview' + (selectedMediaPreview || selectedMediaPersistent ? ' has-media' : '') + '">' +
          renderUploadPreview() +
        '</div>' +
        '<div class="connect-upload-actions">' +
          '<button class="connect-upload-tool" type="button" data-connect-upload-tool="crop">Crop</button>' +
          '<button class="connect-upload-tool" type="button" data-connect-upload-tool="rotate">Rotate</button>' +
          '<button class="connect-upload-tool is-danger" type="button" data-connect-upload-tool="remove">Remove</button>' +
        '</div>' +
        renderCropControls() +
      '</div>'
    );
  }

  function renderUploadPreview() {
    const previewSource = selectedMediaPreview || selectedMediaPersistent;
    if (!previewSource) {
      return '<div class="connect-upload-empty">Choose an image or video to preview your ' + escapeHtml(selectedType) + ' before moving to the caption step.</div>';
    }

    if (selectedMediaType === 'video') {
      return '<video src="' + escapeHtml(previewSource) + '" controls playsinline preload="metadata"></video>';
    }

    return (
      '<div class="connect-media-frame">' +
        '<img class="connect-crop-image" src="' + escapeHtml(previewSource) + '" alt="Selected media preview" loading="lazy" decoding="async" style="' + escapeHtml(buildImageStyle(getDraftMediaCrop())) + '" />' +
      '</div>'
    );
  }

  function renderCaptionStep() {
    return (
      '<div class="connect-caption-stage">' +
        '<div class="connect-upload-preview has-media">' +
          renderUploadPreview() +
        '</div>' +
        '<label class="connect-upload-field">' +
          '<span class="mini-label">Caption</span>' +
          '<textarea id="connect-caption-input" class="connect-caption-textarea" placeholder="Write the caption for your ' + escapeHtml(selectedType) + '...">' + escapeHtml(draftCaption) + '</textarea>' +
        '</label>' +
      '</div>'
    );
  }

  function renderCropControls() {
    if (!cropControlsOpen || selectedMediaType !== 'image' || !(selectedMediaPreview || selectedMediaPersistent)) {
      return '';
    }

    return (
      '<div class="connect-crop-controls">' +
        '<div class="connect-crop-controls-head">' +
          '<span class="mini-label">Crop Controls</span>' +
          '<span class="connect-crop-controls-copy">Adjust the preview until it looks right, then tap Next.</span>' +
        '</div>' +
        '<label class="connect-crop-control">' +
          '<span>Zoom</span>' +
          '<input id="connect-crop-scale" type="range" min="1" max="2" step="0.05" value="' + escapeHtml(cropScale) + '" />' +
        '</label>' +
        '<label class="connect-crop-control">' +
          '<span>Horizontal</span>' +
          '<input id="connect-crop-x" type="range" min="0" max="100" step="1" value="' + escapeHtml(cropX) + '" />' +
        '</label>' +
        '<label class="connect-crop-control">' +
          '<span>Vertical</span>' +
          '<input id="connect-crop-y" type="range" min="0" max="100" step="1" value="' + escapeHtml(cropY) + '" />' +
        '</label>' +
      '</div>'
    );
  }

  function resetCreateFlow() {
    createStep = 'selectType';
    selectedType = 'post';
    clearSelectedMedia();
    draftCaption = '';
  }

  function clearSelectedMedia() {
    if (selectedMediaPreview) {
      URL.revokeObjectURL(selectedMediaPreview);
    }

    selectedMediaFile = null;
    selectedMediaPreview = '';
    selectedMediaPersistent = '';
    selectedMediaType = '';
    cropControlsOpen = false;
    cropScale = 1;
    cropX = 50;
    cropY = 50;
    cropRotation = 0;
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

  function loadPosts() {
    if (typeof app.requestJson !== 'function') {
      postsLoaded = true;
      renderPosts();
      return Promise.resolve();
    }

    return app.requestJson('posts')
      .then(function (data) {
        posts = normalizePosts(data && data.posts);
        postsLoaded = true;
        renderPosts();
      })
      .catch(function (error) {
        postsLoaded = true;
        renderPosts();
        if (typeof window.showToast === 'function') {
          window.showToast(error && error.message ? error.message : 'Unable to load the feed right now.', 'error');
        }
      });
  }

  function normalizePosts(rawPosts) {
    if (!Array.isArray(rawPosts)) {
      return [];
    }

    return rawPosts.filter(function (post) {
      return post && post.id && (post.persistentMedia || post.media) && post.type;
    }).map(function (post) {
      return normalizePost(post);
    }).sort(function (left, right) {
      return Number(right.id) - Number(left.id);
    });
  }

  function normalizePost(post) {
    const normalizedPost = Object.assign({}, post || {});
    normalizedPost.id = String(normalizedPost.id || '');
    normalizedPost.user = String(normalizedPost.user || 'Athlete');
    normalizedPost.avatar = String(normalizedPost.avatar || '').trim();
    normalizedPost.type = String(normalizedPost.type || 'post').toLowerCase();
    normalizedPost.mediaType = String(normalizedPost.mediaType || normalizedPost.type || 'image').toLowerCase();
    normalizedPost.media = resolveMediaUrl(String(normalizedPost.media || normalizedPost.persistentMedia || ''));
    normalizedPost.persistentMedia = resolveMediaUrl(String(normalizedPost.persistentMedia || normalizedPost.media || ''));
    normalizedPost.caption = String(normalizedPost.caption || '');
    normalizedPost.likes = Number(normalizedPost.likes || 0);
    normalizedPost.liked = Boolean(normalizedPost.liked);
    normalizedPost.createdAt = normalizedPost.createdAt || new Date().toISOString();
    normalizedPost.crop = normalizedPost.crop || null;

    return normalizedPost;
  }

  function renderPosts() {
    if (!connectPostsGrid) {
      return;
    }

    if (!postsLoaded) {
      connectPostsGrid.innerHTML = '<article class="glass-card card connect-post-card"><p class="muted">Loading posts...</p></article>';
      return;
    }

    const feedPosts = posts.concat(demoPosts.map(normalizePost));

    if (!feedPosts.length) {
      connectPostsGrid.innerHTML = '<article class="glass-card card connect-post-card"><p class="muted">No posts yet. Be the first to share your workout.</p></article>';
      return;
    }

    connectPostsGrid.innerHTML = feedPosts.map(function (post) {
      return renderPostCard(post);
    }).join('');
  }

  function renderPostCard(post) {
    return (
      '<article class="glass-card card connect-post-card" data-post-id="' + post.id + '">' +
        '<div class="connect-post-header">' +
          '<div class="connect-post-author">' +
            renderPostAvatar(post) +
            '<div class="connect-post-author-copy">' +
              '<h3 class="connect-post-username">' + escapeHtml(post.user || 'Athlete') + '</h3>' +
              '<span class="connect-post-time">' + escapeHtml(post.time || formatPostDate(post.createdAt)) + '</span>' +
            '</div>' +
          '</div>' +
          '<span class="connect-post-type">' + escapeHtml(post.type) + '</span>' +
        '</div>' +
        '<div class="connect-post-media is-' + escapeHtml(post.type || 'post') + '">' +
          renderPostMedia(post) +
        '</div>' +
        '<div class="connect-post-copy">' +
          '<div class="connect-post-actions">' +
            renderPostActionButton(post, 'like', post.liked ? 'Liked' : 'Like', 'like') +
            renderPostActionButton(post, 'comment', 'Comment', 'comment') +
            renderPostActionButton(post, 'share', 'Share', 'share') +
          '</div>' +
          '<p class="connect-post-caption-line"><span class="connect-post-caption-user">' + escapeHtml(post.user || 'Athlete') + '</span>' + escapeHtml(post.caption || 'No caption added.') + '</p>' +
        '</div>' +
      '</article>'
    );
  }

  function renderPostAvatar(post) {
    const avatar = String(post.avatar || '').trim();
    const userLabel = escapeHtml(post.user || 'Athlete');
    const resolvedAvatar = typeof app.resolveProfilePhoto === 'function'
      ? app.resolveProfilePhoto(avatar, post.user || 'Athlete')
      : (avatar || (typeof app.createAvatarPlaceholder === 'function' ? app.createAvatarPlaceholder(post.user || 'Athlete') : ''));

    if (resolvedAvatar) {
      return '<img class="connect-post-avatar" src="' + escapeHtml(resolvedAvatar) + '" alt="' + userLabel + ' avatar" loading="lazy" decoding="async" width="46" height="46" />';
    }

    return '<span class="connect-post-avatar" aria-hidden="true"></span>';
  }

  function renderPostActionButton(post, action, label, iconType) {
    const isActive = action === 'like' && Boolean(post.liked);

    return (
      '<button class="connect-post-action' + (isActive ? ' is-active' : '') + '" type="button" data-post-id="' + post.id + '" data-post-action="' + action + '">' +
        '<span class="connect-post-action-icon">' + renderPostActionIcon(iconType, isActive) + '</span>' +
        '<span>' + label + '</span>' +
      '</button>'
    );
  }

  function handlePostAction(button) {
    const postId = String(button.getAttribute('data-post-id') || '');
    const action = String(button.getAttribute('data-post-action') || '');
    const postIndex = posts.findIndex(function (post) {
      return String(post.id) === postId;
    });
    const demoPostIndex = demoPosts.findIndex(function (post) {
      return String(post.id) === postId;
    });

    if ((postIndex === -1 && demoPostIndex === -1) || !action) {
      return;
    }

    if (action === 'like') {
      if (postIndex !== -1) {
        posts[postIndex].liked = !posts[postIndex].liked;
        updateSinglePostCard(posts[postIndex]);
        return;
      }

      demoPosts[demoPostIndex].liked = !demoPosts[demoPostIndex].liked;
      updateSinglePostCard(normalizePost(demoPosts[demoPostIndex]));
      return;
    }

    if (typeof window.showToast === 'function') {
      if (action === 'comment') {
        window.showToast('Comments are coming soon.', 'success');
      } else if (action === 'share') {
        window.showToast('Share options are coming soon.', 'success');
      }
    }
  }

  function updateSinglePostCard(post) {
    if (!connectPostsGrid || !post) {
      return;
    }

    const existingCard = connectPostsGrid.querySelector('[data-post-id="' + post.id + '"]');
    if (!existingCard) {
      renderPosts();
      return;
    }

    existingCard.outerHTML = renderPostCard(post);
  }

  function renderPostMedia(post) {
    const mediaSource = post.persistentMedia || post.media;
    const mediaType = String(post.mediaType || '').toLowerCase();

    if (mediaType === 'video' || post.type === 'video') {
      return '<video src="' + escapeHtml(mediaSource) + '" controls playsinline preload="metadata"></video>';
    }

    return (
      '<div class="connect-media-frame">' +
        '<img class="connect-crop-image" src="' + escapeHtml(mediaSource) + '" alt="Post upload preview" loading="lazy" decoding="async" style="' + escapeHtml(buildImageStyle(post.crop)) + '" />' +
      '</div>'
    );
  }

  function formatPostDate(value) {
    const date = new Date(value);

    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  function renderPostActionIcon(type, isActive) {
    const icons = {
      like:
        '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">' +
          '<path d="M10 17.2 8.8 16.1C4.2 11.9 1.2 9.1 1.2 5.6c0-2.5 1.9-4.4 4.3-4.4 1.5 0 2.9.7 3.8 1.9.9-1.2 2.3-1.9 3.8-1.9 2.4 0 4.3 1.9 4.3 4.4 0 3.5-3 6.3-7.6 10.5L10 17.2Z" fill="' + (isActive ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' +
        '</svg>',
      comment:
        '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">' +
          '<path d="M3 4.6c0-1 .8-1.8 1.8-1.8h10.4c1 0 1.8.8 1.8 1.8v7.1c0 1-.8 1.8-1.8 1.8H8l-3.5 3v-3H4.8c-1 0-1.8-.8-1.8-1.8V4.6Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>' +
        '</svg>',
      share:
        '<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">' +
          '<path d="M11.8 2.8 17 8l-5.2 5.2V9.8H8.5A4.7 4.7 0 0 0 3.8 14.5v.7c0-4 2.7-6.8 6.7-6.8h1.3V2.8Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg>'
    };

    return icons[type] || '';
  }

  function capitalizeWord(value) {
    const text = String(value || '');
    if (!text) {
      return '';
    }

    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function publishDraftPost() {
    if (!hasSelectedMedia()) {
      if (typeof window.showToast === 'function') {
        window.showToast('Upload media before posting.', 'error');
      }
      return;
    }

    if (!selectedMediaFile) {
      if (typeof window.showToast === 'function') {
        window.showToast('Choose a media file before posting.', 'error');
      }
      return;
    }

    if (typeof app.requestJson !== 'function') {
      if (typeof window.showToast === 'function') {
        window.showToast('Posting is unavailable right now.', 'error');
      }
      return;
    }

    modalNextButton.disabled = true;
    modalNextButton.textContent = 'Posting...';
    const submittedType = selectedType;

    const formData = new FormData();
    formData.append('type', selectedType);
    formData.append('caption', String(draftCaption || '').trim());
    formData.append('media', selectedMediaFile);

    if (selectedMediaType === 'image') {
      formData.append('crop_scale', String(cropScale));
      formData.append('crop_x', String(cropX));
      formData.append('crop_y', String(cropY));
      formData.append('crop_rotation', String(cropRotation));
    }

    app.requestJson('posts', {
      method: 'POST',
      body: formData
    })
      .then(function (data) {
        if (data && data.post) {
          posts.unshift(normalizePost(data.post));
          renderPosts();
        } else {
          return loadPosts();
        }
      })
      .then(function () {
        closeTypeModal();
        resetCreateFlow();
        if (typeof window.showToast === 'function') {
          window.showToast(capitalizeWord(submittedType) + ' posted successfully.', 'success');
        }
      })
      .catch(function (error) {
        if (typeof window.showToast === 'function') {
          window.showToast(error && error.message ? error.message : 'Unable to publish post.', 'error');
        }
      })
      .finally(function () {
        modalNextButton.disabled = false;
        renderCreateFlow();
      });
  }

  function getDraftMediaCrop() {
    return {
      scale: Number(cropScale || 1),
      x: Number(cropX || 50),
      y: Number(cropY || 50),
      rotation: Number(cropRotation || 0)
    };
  }

  function buildImageStyle(crop) {
    const imageCrop = crop || {};
    const scale = clampNumber(imageCrop.scale, 1, 2, 1);
    const x = clampNumber(imageCrop.x, 0, 100, 50);
    const y = clampNumber(imageCrop.y, 0, 100, 50);
    const rotation = Number(imageCrop.rotation || 0);

    return 'object-position:' + x + '% ' + y + '%;transform:scale(' + scale + ') rotate(' + rotation + 'deg);';
  }

  function clampNumber(value, min, max, fallback) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      return fallback;
    }

    return Math.min(Math.max(numericValue, min), max);
  }

  function hasSelectedMedia() {
    return Boolean(selectedMediaPersistent || selectedMediaPreview || selectedMediaFile);
  }

  function resolveMediaUrl(value) {
    const mediaValue = String(value || '').trim();
    if (!mediaValue) {
      return '';
    }

    if (mediaValue.startsWith('data:') || mediaValue.startsWith('blob:') || mediaValue.startsWith('http://') || mediaValue.startsWith('https://')) {
      return mediaValue;
    }

    const normalizedMediaValue = mediaValue.replace(/\\/g, '/');

    try {
      return new URL(normalizedMediaValue, window.location.origin).href;
    } catch (error) {
      return normalizedMediaValue;
    }
  }

  function readFileAsDataUrl(file) {
    return new Promise(function (resolve, reject) {
      if (!file) {
        reject(new Error('Missing file.'));
        return;
      }

      const reader = new FileReader();

      reader.onload = function () {
        resolve(String(reader.result || ''));
      };

      reader.onerror = function () {
        reject(reader.error || new Error('Unable to read file.'));
      };

      reader.readAsDataURL(file);
    });
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
