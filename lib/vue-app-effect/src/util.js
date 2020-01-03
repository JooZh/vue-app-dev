// production
import config from "../../../src/app.json";

function getComponent(name) {
  if (name) {
    return require(`../../../src/${name}`).default;
  } else {
    return null;
  }
}

export { config, getComponent };
