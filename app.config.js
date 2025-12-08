import 'dotenv/config';

export default ({ config }) => {
  return {
    ...config, // Loads all settings from your existing app.json
    extra: {
      ...config.extra,
      // Priority 1: Use .env file (Local Development)
      // Priority 2: Use app.json fallback (Production/Default)
      apiUrl: process.env.API_URL || config.extra?.apiUrl,
    },
  };
};
