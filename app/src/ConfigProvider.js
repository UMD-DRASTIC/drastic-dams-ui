function ConfigProvider(env) {
  var about = {
     Version: 0.1,
     Author: "Greg Jansen",
     Created: "Fall 2020",
     Updated: "Fall 2020"
  };
  if (window === this) {
    return new ConfigProvider(env);
  }
  this.process_env = env
  this.CONFIG = {
    baseURL: '$VUE_APP_BASE_URL',
    ldpURL: '$VUE_APP_LDP_URL',
    asWebSocketURL: '$VUE_APP_AS_WEBSOCKET_URL',
    ldpUsername: '$VUE_APP_LDP_USERNAME',
    ldpPassword: '$VUE_APP_LDP_PASSWORD',
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
      const envValue = this.process_env[envName];
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
