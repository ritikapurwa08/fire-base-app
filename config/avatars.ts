export const AVATAR_CONFIG = {
  default: '/web-avatars/upstream/upstream_1.png',
  categories: {
    upstream: {
      label: 'Upstream',
      path: '/web-avatars/upstream',
      count: 20, // upstream_1.png to upstream_20.png
      prefix: 'upstream_',
      extension: '.png',
    },
    teams: {
      label: 'Teams',
      path: '/web-avatars/teams',
      count: 9, // teams_1.png to teams_9.png
      prefix: 'teams_',
      extension: '.png',
    },
  },
};

export const getAllAvatars = () => {
  const avatars: string[] = [];

  // Upstream
  for (let i = 1; i <= AVATAR_CONFIG.categories.upstream.count; i++) {
    avatars.push(
      `${AVATAR_CONFIG.categories.upstream.path}/${AVATAR_CONFIG.categories.upstream.prefix}${i}${AVATAR_CONFIG.categories.upstream.extension}`,
    );
  }

  // Teams
  for (let i = 1; i <= AVATAR_CONFIG.categories.teams.count; i++) {
    avatars.push(
      `${AVATAR_CONFIG.categories.teams.path}/${AVATAR_CONFIG.categories.teams.prefix}${i}${AVATAR_CONFIG.categories.teams.extension}`,
    );
  }

  return avatars;
};

export const getAvatarsByCategory = (category: 'upstream' | 'teams') => {
  const config = AVATAR_CONFIG.categories[category];
  const list: string[] = [];

  for (let i = 1; i <= config.count; i++) {
    list.push(`${config.path}/${config.prefix}${i}${config.extension}`);
  }

  return list;
};
