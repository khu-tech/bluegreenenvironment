import React from "react";
import { VERSION } from "@twilio/flex-ui";
import { FlexPlugin } from "@twilio/flex-plugin";

import CustomTaskListContainer from "./components/CustomTaskList/CustomTaskList.Container";
import reducers, { namespace } from "./states";

const serviceVersion = window.appConfig.ServiceConfiguration.attributes;
const PLUGIN_NAME = "SamplePlugin";

export default class SamplePlugin extends FlexPlugin {
  constructor() {
    super(PLUGIN_NAME);
  }

  /**
   * This code is run when your plugin is being started
   * Use this to modify any UI components or attach to the actions framework
   *
   * @param flex { typeof import('@twilio/flex-ui') }
   * @param manager { import('@twilio/flex-ui').Manager }
   */
  async init(flex, manager) {
    this.registerReducers(manager);
    console.log("the service version is" + serviceVersion);

    const options = { sortOrder: -1 };
    console.log("This is plugin V1");
    flex.AgentDesktopView.Panel1.Content.add(
      <CustomTaskListContainer key="SamplePlugin-component" />,
      options
    );
    console.log("start calling API");
    this.dataRequest("start_streaming", manager, null);
  }

  dataRequest = async (path, manager, params) => {
    const body = {
      ...params,
      Token: manager.store.getState().flex.session.ssoTokenPayload.token,
    };

    const options = {
      method: "POST",
      body: new URLSearchParams(body),
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
    };

    const REACT_APP_SERVICE_BASE_URL =
      serviceVersion == "V1"
        ? process.env.REACT_APP_SERVICE_BASE_URL_V1
        : serviceVersion == "V2"
        ? process.env.REACT_APP_SERVICE_BASE_URL_V2
        : process.env.REACT_APP_SERVICE_BASE_URL_V1;

    console.log(
      "REQUEST BASE URL: ",
      REACT_APP_SERVICE_BASE_URL,
      " PATH:",
      path
    );
    var resp = await fetch(`${REACT_APP_SERVICE_BASE_URL}/${path}`, options);
    console.log("try to call API");
    return await resp.json();
  };

  /**
   * Registers the plugin reducers
   *
   * @param manager { Flex.Manager }
   */
  registerReducers(manager) {
    if (!manager.store.addReducer) {
      // eslint-disable-next-line
      console.error(
        `You need FlexUI > 1.9.0 to use built-in redux; you are currently on ${VERSION}`
      );
      return;
    }

    manager.store.addReducer(namespace, reducers);
  }
}
