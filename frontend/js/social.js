(function () {
  const app = window.MuscleMap || {};
  const STORAGE_KEY = 'musclemap-social-state-v1';
  const now = Date.now();
  const defaultState = {
    currentUserId: 'maya-chen',
    likedPostIds: ['post-2'],
    authors: [
      {
        id: 'maya-chen',
        name: 'Maya Chen',
        handle: 'maya.moves',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=400',
        headline: 'Strength coach building clean, practical training blocks.',
        bio: 'Short notes, progress photos, and weekly training recaps without the noise.',
        location: 'Bengaluru',
        focus: 'Power + conditioning',
        tags: ['Coach', 'Hybrid Block', 'Bench Focus'],
        verified: true,
        private: false,
        followers: ['aisha-rao', 'tara-singh', 'neel-kapoor'],
        following: ['aisha-rao', 'omar-khan', 'tara-singh']
      },
      {
        id: 'aisha-rao',
        name: 'Aisha Rao',
        handle: 'aisha.lifts',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400',
        headline: 'Powerbuilder logging meet prep and lower-body volume.',
        bio: 'Sharing pull-day checkpoints, rep-speed notes, and heavy-day photos from the floor.',
        location: 'Mumbai',
        focus: 'Powerbuilding',
        tags: ['Meet Prep', 'Deadlift', 'Volume'],
        verified: true,
        private: false,
        followers: ['maya-chen', 'omar-khan', 'neel-kapoor'],
        following: ['maya-chen', 'tara-singh']
      },
      {
        id: 'omar-khan',
        name: 'Omar Khan',
        handle: 'omar.strength',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
        headline: 'Technique-first lifter posting crisp barbell updates.',
        bio: 'Mostly training notes, rack videos, and quick adjustments between blocks.',
        location: 'Delhi',
        focus: 'Strength Skill',
        tags: ['Squat', 'Tempo Work', 'Technique'],
        verified: false,
        private: false,
        followers: ['maya-chen', 'tara-singh'],
        following: ['aisha-rao', 'neel-kapoor']
      },
      {
        id: 'tara-singh',
        name: 'Tara Singh',
        handle: 'tara.trains',
        avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&q=80&w=400',
        headline: 'Consistent training logs with a bias for clean nutrition and recovery.',
        bio: 'I post quick gym snapshots, recovery notes, and the occasional form breakdown.',
        location: 'Pune',
        focus: 'Lean Strength',
        tags: ['Recovery', 'Upper Lower', 'Consistency'],
        verified: false,
        private: false,
        followers: ['maya-chen', 'aisha-rao'],
        following: ['maya-chen', 'aisha-rao', 'omar-khan']
      },
      {
        id: 'neel-kapoor',
        name: 'Neel Kapoor',
        handle: 'neel.builds',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
        headline: 'High-volume physique sessions and compact training diaries.',
        bio: 'Posting compact progress updates with a mix of training clips and hypertrophy notes.',
        location: 'Hyderabad',
        focus: 'Hypertrophy',
        tags: ['Pump Work', 'Arms', 'Upper Volume'],
        verified: false,
        private: false,
        followers: ['aisha-rao', 'omar-khan'],
        following: ['maya-chen']
      }
    ],
    posts: [
      {
        id: 'post-1',
        authorId: 'maya-chen',
        message: 'Short update after today\\'s top set: bar path felt cleaner once I narrowed my stance a touch. Keeping next week conservative and crisp.',
        imageUrl: '',
        location: 'Bengaluru Strength Room',
        createdAt: now - 1000 * 60 * 55,
        likes: 42,
        comments: [
          {
            id: 'comment-1',
            authorId: 'aisha-rao',
            message: 'That tighter setup really shows up on the lockout.',
            createdAt: now - 1000 * 60 * 33
          },
          {
            id: 'comment-2',
            authorId: 'omar-khan',
            message: 'Smart call. Clean reps beat noisy grinders here.',
            createdAt: now - 1000 * 60 * 27
          }
        ]
      },
      {
        id: 'post-2',
        authorId: 'aisha-rao',
        message: 'Photo post from the final pull before deload. Low volume, high intent, and out before the gym gets busy.',
        imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=1400',
        location: 'Mumbai Barbell Club',
        createdAt: now - 1000 * 60 * 140,
        likes: 128,
        comments: [
          {
            id: 'comment-3',
            authorId: 'maya-chen',
            message: 'Best kind of photo post: heavy and uncomplicated.',
            createdAt: now - 1000 * 60 * 112
          }
        ]
      },
      {
        id: 'post-3',
        authorId: 'omar-khan',
        message: 'Nothing visual today, just a reminder that technique blocks are supposed to look quiet. If the set looks dramatic, it probably drifted.',
        imageUrl: '',
        location: 'Delhi Performance Lab',
        createdAt: now - 1000 * 60 * 240,
        likes: 67,
        comments: [
          {
            id: 'comment-4',
            authorId: 'tara-singh',
            message: 'This is exactly the right read on it.',
            createdAt: now - 1000 * 60 * 215
          }
        ]
      },
      {
        id: 'post-4',
        authorId: 'tara-singh',
        message: 'Instagram-style check-in: meal prep is sorted, upper session is done, and recovery is finally catching up to the workload.',
        imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=1400',
        location: 'Pune Training Studio',
        createdAt: now - 1000 * 60 * 410,
        likes: 84,
        comments: [
          {
            id: 'comment-5',
            authorId: 'neel-kapoor',
            message: 'This looks dialed in.',
            createdAt: now - 1000 * 60 * 380
          }
        ]
      },
      {
        id: 'post-5',
        authorId: 'maya-chen',
        message: 'Photo drop from accessory day. The session was intentionally boring and that is exactly why it worked.',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=1400',
        location: 'Bengaluru Strength Room',
        createdAt: now - 1000 * 60 * 740,
        likes: 91,
        comments: [
          {
            id: 'comment-6',
            authorId: 'aisha-rao',
            message: 'Boring sessions usually produce the best weeks.',
            createdAt: now - 1000 * 60 * 705
          },
          {
            id: 'comment-7',
            authorId: 'tara-singh',
            message: 'This is the right kind of discipline.',
            createdAt: now - 1000 * 60 * 690
          }
        ]
      },
      {
        id: 'post-6',
        authorId: 'neel-kapoor',
        message: 'Trying a slightly slower eccentric on rows this block. Feels less dramatic on camera, much better where it counts.',
        imageUrl: '',
        location: 'Hyderabad Iron House',
        createdAt: now - 1000 * 60 * 1260,
        likes: 39,
        comments: []
      }
    ]
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function uniqueIds(values) {
    return Array.from(new Set((values || []).filter(Boolean)));
  }

  function normalizeState(rawState) {
    if (!rawState || typeof rawState !== 'object') {
      return clone(defaultState);
    }

    const nextState = {
      currentUserId: typeof rawState.currentUserId === 'string' ? rawState.currentUserId : defaultState.currentUserId,
      likedPostIds: uniqueIds(Array.isArray(rawState.likedPostIds) ? rawState.likedPostIds : []),
      authors: Array.isArray(rawState.authors) ? rawState.authors.map(function (author) {
        return Object.assign({}, author, {
          tags: Array.isArray(author.tags) ? uniqueIds(author.tags) : [],
          followers: uniqueIds(Array.isArray(author.followers) ? author.followers : []),
          following: uniqueIds(Array.isArray(author.following) ? author.following : [])
        });
      }) : clone(defaultState.authors),
      posts: Array.isArray(rawState.posts) ? rawState.posts.map(function (post) {
        return Object.assign({}, post, {
          likes: Number(post.likes) || 0,
          comments: Array.isArray(post.comments) ? post.comments.map(function (comment) {
            return Object.assign({}, comment);
          }) : []
        });
      }) : clone(defaultState.posts)
    };

    if (!nextState.authors.some(function (author) { return author.id === nextState.currentUserId; })) {
      return clone(defaultState);
    }

    nextState.authors = nextState.authors.map(function (author) {
      return Object.assign({}, author, {
        followers: author.followers.filter(function (id) {
          return id !== author.id && nextState.authors.some(function (candidate) { return candidate.id === id; });
        }),
        following: author.following.filter(function (id) {
          return id !== author.id && nextState.authors.some(function (candidate) { return candidate.id === id; });
        }),
        private: Boolean(author.private),
        verified: Boolean(author.verified)
      });
    });

    nextState.posts = nextState.posts.filter(function (post) {
      return post && typeof post.id === 'string' && nextState.authors.some(function (author) { return author.id === post.authorId; });
    });

    nextState.likedPostIds = nextState.likedPostIds.filter(function (postId) {
      return nextState.posts.some(function (post) { return post.id === postId; });
    });

    return nextState;
  }

  function loadState() {
    try {
      const rawValue = window.localStorage.getItem(STORAGE_KEY);
      if (!rawValue) {
        return clone(defaultState);
      }
      return normalizeState(JSON.parse(rawValue));
    } catch (error) {
      return clone(defaultState);
    }
  }

  let state = loadState();

  function saveState() {
    state = normalizeState(state);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      // Ignore storage failures and keep working with in-memory state.
    }
  }

  function getRawAuthor(authorId) {
    return state.authors.find(function (author) {
      return author.id === authorId;
    }) || null;
  }

  function getRawPost(postId) {
    return state.posts.find(function (post) {
      return post.id === postId;
    }) || null;
  }

  function resolveAvatar(author) {
    if (author && author.avatar) {
      return author.avatar;
    }

    if (author && typeof app.createAvatarPlaceholder === 'function') {
      return app.createAvatarPlaceholder(author.name || author.handle || 'MM');
    }

    return '';
  }

  function buildMiniAuthor(authorId) {
    const rawAuthor = getRawAuthor(authorId);
    if (!rawAuthor) {
      return null;
    }

    return {
      id: rawAuthor.id,
      name: rawAuthor.name,
      handle: rawAuthor.handle,
      avatar: resolveAvatar(rawAuthor),
      headline: rawAuthor.headline,
      private: Boolean(rawAuthor.private),
      verified: Boolean(rawAuthor.verified)
    };
  }

  function isFollowing(authorId) {
    const currentUser = getRawAuthor(state.currentUserId);
    if (!currentUser || authorId === state.currentUserId) {
      return false;
    }

    return currentUser.following.indexOf(authorId) !== -1;
  }

  function getAuthor(authorId) {
    const rawAuthor = getRawAuthor(authorId);
    if (!rawAuthor) {
      return null;
    }

    const followerIds = uniqueIds(rawAuthor.followers);
    const followingIds = uniqueIds(rawAuthor.following);

    return {
      id: rawAuthor.id,
      name: rawAuthor.name,
      handle: rawAuthor.handle,
      avatar: resolveAvatar(rawAuthor),
      headline: rawAuthor.headline,
      bio: rawAuthor.bio,
      location: rawAuthor.location,
      focus: rawAuthor.focus,
      tags: uniqueIds(rawAuthor.tags),
      private: Boolean(rawAuthor.private),
      verified: Boolean(rawAuthor.verified),
      followersCount: followerIds.length,
      followingCount: followingIds.length,
      followers: followerIds.map(buildMiniAuthor).filter(Boolean),
      following: followingIds.map(buildMiniAuthor).filter(Boolean),
      isCurrentUser: rawAuthor.id === state.currentUserId,
      isFollowed: isFollowing(rawAuthor.id)
    };
  }

  function getAuthors() {
    return state.authors.map(function (author) {
      return getAuthor(author.id);
    }).filter(Boolean);
  }

  function getCurrentUser() {
    return getAuthor(state.currentUserId);
  }

  function formatRelativeTime(timestamp) {
    const timeValue = Number(timestamp) || 0;
    const diffMs = Math.max(0, Date.now() - timeValue);
    const diffMinutes = Math.round(diffMs / 60000);

    if (diffMinutes < 1) {
      return 'Just now';
    }

    if (diffMinutes < 60) {
      return diffMinutes + 'm ago';
    }

    if (diffMinutes < 1440) {
      return Math.round(diffMinutes / 60) + 'h ago';
    }

    if (diffMinutes < 10080) {
      return Math.round(diffMinutes / 1440) + 'd ago';
    }

    return Math.round(diffMinutes / 10080) + 'w ago';
  }

  function formatCount(value) {
    const count = Number(value) || 0;
    if (count >= 1000000) {
      return (count / 1000000).toFixed(count >= 10000000 ? 0 : 1).replace(/\.0$/, '') + 'M';
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(count >= 10000 ? 0 : 1).replace(/\.0$/, '') + 'K';
    }
    return String(count);
  }

  function resolveComment(rawComment) {
    const author = getAuthor(rawComment.authorId);

    return {
      id: rawComment.id,
      authorId: rawComment.authorId,
      authorName: author ? author.name : 'Member',
      authorHandle: author ? author.handle : 'member',
      authorAvatar: author ? author.avatar : resolveAvatar({ name: 'Member' }),
      message: rawComment.message || '',
      createdAt: Number(rawComment.createdAt) || Date.now(),
      timeLabel: formatRelativeTime(rawComment.createdAt)
    };
  }

  function resolvePost(rawPost) {
    const author = getAuthor(rawPost.authorId);
    if (!author) {
      return null;
    }

    return {
      id: rawPost.id,
      author: author,
      message: rawPost.message || '',
      imageUrl: rawPost.imageUrl || '',
      location: rawPost.location || '',
      createdAt: Number(rawPost.createdAt) || Date.now(),
      timeLabel: formatRelativeTime(rawPost.createdAt),
      likes: Number(rawPost.likes) || 0,
      comments: (rawPost.comments || []).map(resolveComment),
      isLiked: state.likedPostIds.indexOf(rawPost.id) !== -1,
      type: rawPost.imageUrl ? 'photo' : 'text'
    };
  }

  function postIsVisible(post) {
    return !post.author.private || post.author.isCurrentUser || post.author.isFollowed;
  }

  function sortPosts(posts) {
    return posts.sort(function (leftPost, rightPost) {
      return rightPost.createdAt - leftPost.createdAt;
    });
  }

  function getFeedPosts(filter) {
    const normalizedFilter = filter || 'all';

    return sortPosts(state.posts.map(resolvePost).filter(Boolean)).filter(function (post) {
      if (!postIsVisible(post)) {
        return false;
      }

      if (normalizedFilter === 'following') {
        return post.author.isCurrentUser || post.author.isFollowed;
      }

      if (normalizedFilter === 'text') {
        return post.type === 'text';
      }

      if (normalizedFilter === 'photo') {
        return post.type === 'photo';
      }

      return true;
    });
  }

  function getProfilePosts(authorId, filter) {
    const normalizedFilter = filter || 'all';

    return sortPosts(state.posts.map(resolvePost).filter(Boolean)).filter(function (post) {
      if (post.author.id !== authorId) {
        return false;
      }

      if (normalizedFilter === 'text') {
        return post.type === 'text';
      }

      if (normalizedFilter === 'photo') {
        return post.type === 'photo';
      }

      return true;
    });
  }

  function getSuggestedAuthors(limit) {
    const maxItems = Number(limit) || 3;

    return getAuthors().filter(function (author) {
      return !author.isCurrentUser && !author.isFollowed;
    }).slice(0, maxItems);
  }

  function addPost(payload) {
    const message = String(payload && payload.message ? payload.message : '').trim();
    const imageUrl = String(payload && payload.imageUrl ? payload.imageUrl : '').trim();

    if (!message) {
      throw new Error('Write something before publishing.');
    }

    state.posts.unshift({
      id: 'post-' + Date.now(),
      authorId: state.currentUserId,
      message: message,
      imageUrl: imageUrl,
      location: getCurrentUser() ? getCurrentUser().location : '',
      createdAt: Date.now(),
      likes: 0,
      comments: []
    });
    saveState();
  }

  function addComment(postId, message) {
    const trimmedMessage = String(message || '').trim();
    const post = getRawPost(postId);

    if (!post || !trimmedMessage) {
      return false;
    }

    post.comments = Array.isArray(post.comments) ? post.comments : [];
    post.comments.push({
      id: 'comment-' + Date.now(),
      authorId: state.currentUserId,
      message: trimmedMessage,
      createdAt: Date.now()
    });
    saveState();
    return true;
  }

  function toggleLike(postId) {
    const post = getRawPost(postId);
    const likedIndex = state.likedPostIds.indexOf(postId);

    if (!post) {
      return false;
    }

    if (likedIndex === -1) {
      state.likedPostIds.push(postId);
      post.likes += 1;
      saveState();
      return true;
    }

    state.likedPostIds.splice(likedIndex, 1);
    post.likes = Math.max(0, post.likes - 1);
    saveState();
    return false;
  }

  function toggleFollow(authorId) {
    const currentUser = getRawAuthor(state.currentUserId);
    const targetAuthor = getRawAuthor(authorId);

    if (!currentUser || !targetAuthor || authorId === state.currentUserId) {
      return false;
    }

    const followingIndex = currentUser.following.indexOf(authorId);
    const followerIndex = targetAuthor.followers.indexOf(state.currentUserId);

    if (followingIndex === -1) {
      currentUser.following.unshift(authorId);
      if (followerIndex === -1) {
        targetAuthor.followers.unshift(state.currentUserId);
      }
      saveState();
      return true;
    }

    currentUser.following.splice(followingIndex, 1);
    if (followerIndex !== -1) {
      targetAuthor.followers.splice(followerIndex, 1);
    }
    saveState();
    return false;
  }

  function canViewProfile(authorId) {
    const author = getAuthor(authorId);
    if (!author) {
      return false;
    }

    return !author.private || author.isCurrentUser || author.isFollowed;
  }

  function setPrivacy(authorId, nextValue) {
    const author = getRawAuthor(authorId);
    if (!author) {
      return false;
    }

    author.private = Boolean(nextValue);
    saveState();
    return author.private;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatMultilineText(value) {
    return escapeHtml(value).replace(/\n/g, '<br />');
  }

  function profileUrl(authorId) {
    const baseUrl = app.links && app.links.socialProfile ? app.links.socialProfile : './social-profile.html';
    return baseUrl + '?user=' + encodeURIComponent(authorId);
  }

  function postsUrl() {
    return app.links && app.links.posts ? app.links.posts : './posts.html';
  }

  function getProfile(authorId) {
    return getAuthor(authorId || state.currentUserId);
  }

  saveState();

  window.MuscleMapSocial = {
    currentUserId: state.currentUserId,
    addComment: addComment,
    addPost: addPost,
    canViewProfile: canViewProfile,
    escapeHtml: escapeHtml,
    formatCount: formatCount,
    formatMultilineText: formatMultilineText,
    getAuthor: getAuthor,
    getAuthors: getAuthors,
    getCurrentUser: getCurrentUser,
    getFeedPosts: getFeedPosts,
    getProfile: getProfile,
    getProfilePosts: getProfilePosts,
    getSuggestedAuthors: getSuggestedAuthors,
    isFollowing: isFollowing,
    postsUrl: postsUrl,
    profileUrl: profileUrl,
    setPrivacy: setPrivacy,
    toggleFollow: toggleFollow,
    toggleLike: toggleLike
  };
})();
