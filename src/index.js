/**
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

import preact, { Component } from 'preact';
import { renderToString } from 'preact-render-to-string';
import * as emotion from 'emotion';
import { ThemeProvider } from 'emotion-theming';
// import { extractCritical } from 'emotion-server';
import template from './template';

var createExtractCritical = function createExtractCritical(emotion) {
  return function (html) {
    // parse out ids from html
    // reconstruct css/rules/cache to pass
    var RGX = new RegExp(emotion.caches.key + "-([a-zA-Z0-9-]+)", 'gm');
    var o = {
      html: html,
      ids: [],
      css: ''
    };
    var match;
    var ids = {};

    while ((match = RGX.exec(html)) !== null) {
      // $FlowFixMe
      if (ids[match[1]] === undefined) {
        // $FlowFixMe
        ids[match[1]] = true;
      }
    }

    o.ids = Object.keys(emotion.caches.inserted).filter(function (id) {
      if ((ids[id] === true || emotion.caches.registered[emotion.caches.key + "-" + id] === undefined) && emotion.caches.inserted[id] !== true) {
        o.css += emotion.caches.inserted[id];
        return true;
      }
    });
    return o;
  };
};

const extractCritical = createExtractCritical(emotion);

import {
  Header,
  Hero,
  SubHero,
  Section,
  CardScroll,
  Footer
} from 'src/components';
import { colors } from 'src/core';
import tools from 'src/tools';

emotion.injectGlobal`
  html,
  body {
    width: 100%;
    padding: 0;
    margin: 0;
    background: #FFF;
    font-family: avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif;
    font-weight: 400;
    color: #444;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  * {
    box-sizing: border-box;
  }

  #app {
    width: 100%;
  }
`;

const primaryTheme = {
  name: 'primary',
  primary: colors.black,
  primaryInverse: colors.white,
  secondary: colors.white,
  tertiary: colors.purple,
  border: colors.grey2,
  borderInverse: colors.white,
  backgroundPrimary: colors.white,
  backgroundSecondary: colors.purple,
  logo: colors.white
};

const secondaryTheme = {
  name: 'secondary',
  primary: colors.white,
  primaryInverse: colors.black,
  secondary: colors.purple,
  tertiary: colors.white,
  border: colors.white,
  borderInverse: colors.grey2,
  backgroundPrimary: colors.purple,
  backgroundSecondary: colors.white,
  logo: colors.purple
};

class App extends Component {
  onListChange = () => {
    this.setState(
      {
        horizontalScroll: !this.state.horizontalScroll
      },
      () =>
        localStorage.setItem('horizontalScroll', this.state.horizontalScroll)
    );
  };

  onThemeChange = () => {
    this.setState(
      {
        theme: this.state.theme === 'primary' ? 'secondary' : 'primary'
      },
      () => localStorage.setItem('theme', this.state.theme)
    );
  };

  constructor() {
    super();

    if (typeof window !== 'undefined') {
      emotion.hydrate(window.__EMOTION_CRITICAL_CSS_IDS__);
      this.state = {
        theme: localStorage.getItem('theme') || 'primary',
        horizontalScroll: localStorage.getItem('horizontalScroll')
          ? JSON.parse(localStorage.getItem('horizontalScroll'))
          : window.innerWidth < 1200
      };
    } else {
      this.state = {
        theme: 'primary',
        horizontalScroll: true
      };
    }
  }

  renderSection(toolType, theme) {
    const { title, subtitle, tools } = toolType;
    const { horizontalScroll } = this.state;

    return (
      <Section heading={title} subHeading={subtitle}>
        <CardScroll horizontalScroll={horizontalScroll} tools={tools} />
      </Section>
    );
  }

  render() {
    const { theme, horizontalScroll } = this.state;

    return (
      <ThemeProvider
        theme={theme === 'primary' ? primaryTheme : secondaryTheme}
      >
        <div id="app">
          <Header
            listChecked={!horizontalScroll}
            themeChecked={theme === 'secondary'}
            onListChange={this.onListChange}
            onThemeChange={this.onThemeChange}
          />
          <Hero />
          <SubHero />
          {Object.keys(tools).map(toolType =>
            this.renderSection(tools[toolType], theme)
          )}
          <Footer />
        </div>
      </ThemeProvider>
    );
  }
}

export default function (params) {
  const url = params.url || '/';
  const { html, ids, css } = extractCritical(renderToString(preact.h(App, { url })));
  return template(html, ids, css);
}
