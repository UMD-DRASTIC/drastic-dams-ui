import dotenv from 'dotenv';

function ConfigProvider() {
  var about = {
     Version: 0.1,
     Author: "Greg Jansen",
     Created: "Fall 2020",
     Updated: "Fall 2020"
  };
  if (window === this) {
    return new ConfigProvider();
  }
  dotenv.config();
  this.CONFIG = {
    baseURL: '$VUE_APP_BASE_URL',
    trellisURL: '$VUE_APP_TRELLIS_URL',
    activityStreamWebSocketURL: '$VUE_APP_AS_WEBSOCKET_URL',
  };
  if(this.CONFIG) {
    return this;
  } else {
    return about;
  }
}

ConfigProvider.prototype = {
  value: function(name) {
    if (!(name in this.CONFIG)) {
      return;
    }

    const value = this.CONFIG[name];

    if (!value) {
      return;
    }

    if (value.startsWith('$VUE_APP_')) {
      const envName = value.substr(1);
      const envValue = process.env[envName];
      if (envValue) {
        return envValue;
      } else {
        return
      }
    } else {
      return value;
    }
  }
}

export { ConfigProvider as default };
