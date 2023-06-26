/*
 * AUTOGENERATED - DON'T EDIT
 * Your edits in this file will be overwritten in the next build!
 * Modify the docusaurus.config.js file at your site's root instead.
 */
export default {
  "title": "LangFlow Documentation",
  "tagline": "LangFlow is a GUI for LangChain, designed with react-flow",
  "favicon": "img/favicon.ico",
  "url": "https://logspace-ai.github.io",
  "baseUrl": "/",
  "onBrokenLinks": "throw",
  "onBrokenMarkdownLinks": "warn",
  "organizationName": "logspace-ai",
  "projectName": "langflow",
  "trailingSlash": false,
  "customFields": {
    "mendableAnonKey": "b7f52734-297c-41dc-8737-edbd13196394"
  },
  "i18n": {
    "defaultLocale": "en",
    "locales": [
      "en"
    ],
    "path": "i18n",
    "localeConfigs": {}
  },
  "presets": [
    [
      "@docusaurus/preset-classic",
      {
        "docs": {
          "routeBasePath": "/",
          "sidebarPath": "/home/carlos/repo/logspace/langflow/docs/sidebars.js",
          "path": "docs"
        },
        "theme": {
          "customCss": "/home/carlos/repo/logspace/langflow/docs/src/css/custom.css"
        }
      }
    ]
  ],
  "plugins": [
    [
      "docusaurus-node-polyfills",
      {
        "excludeAliases": [
          "console"
        ]
      }
    ],
    "docusaurus-plugin-image-zoom",
    null
  ],
  "themeConfig": {
    "navbar": {
      "hideOnScroll": true,
      "title": "LangFlow",
      "logo": {
        "alt": "LangFlow",
        "src": "img/chain.png"
      },
      "items": [
        {
          "position": "right",
          "href": "https://github.com/logspace-ai/langflow",
          "className": "header-github-link",
          "target": "_blank",
          "rel": null
        },
        {
          "position": "right",
          "href": "https://twitter.com/logspace_ai",
          "className": "header-twitter-link",
          "target": "_blank",
          "rel": null
        },
        {
          "position": "right",
          "href": "https://discord.gg/EqksyE2EX9",
          "className": "header-discord-link",
          "target": "_blank",
          "rel": null
        }
      ]
    },
    "tableOfContents": {
      "minHeadingLevel": 2,
      "maxHeadingLevel": 5
    },
    "colorMode": {
      "defaultMode": "light",
      "disableSwitch": true,
      "respectPrefersColorScheme": false
    },
    "announcementBar": {
      "content": "⭐️ If you like ⛓️LangFlow, star it on <a target=\"_blank\" rel=\"noopener noreferrer\" href=\"https://github.com/logspace-ai/langflow\">GitHub</a>! ⭐️",
      "backgroundColor": "#B53D38",
      "textColor": "#fff",
      "isCloseable": false,
      "id": "announcement-bar"
    },
    "footer": {
      "links": [],
      "copyright": "Copyright © 2023 Logspace.",
      "style": "light"
    },
    "zoom": {
      "selector": ".markdown :not(a) > img:not(.no-zoom)",
      "background": {
        "light": "rgba(240, 240, 240, 0.9)"
      },
      "config": {}
    },
    "prism": {
      "theme": {
        "plain": {
          "color": "#393A34",
          "backgroundColor": "#f6f8fa"
        },
        "styles": [
          {
            "types": [
              "comment",
              "prolog",
              "doctype",
              "cdata"
            ],
            "style": {
              "color": "#999988",
              "fontStyle": "italic"
            }
          },
          {
            "types": [
              "namespace"
            ],
            "style": {
              "opacity": 0.7
            }
          },
          {
            "types": [
              "string",
              "attr-value"
            ],
            "style": {
              "color": "#e3116c"
            }
          },
          {
            "types": [
              "punctuation",
              "operator"
            ],
            "style": {
              "color": "#393A34"
            }
          },
          {
            "types": [
              "entity",
              "url",
              "symbol",
              "number",
              "boolean",
              "variable",
              "constant",
              "property",
              "regex",
              "inserted"
            ],
            "style": {
              "color": "#36acaa"
            }
          },
          {
            "types": [
              "atrule",
              "keyword",
              "attr-name",
              "selector"
            ],
            "style": {
              "color": "#00a4db"
            }
          },
          {
            "types": [
              "function",
              "deleted",
              "tag"
            ],
            "style": {
              "color": "#d73a49"
            }
          },
          {
            "types": [
              "function-variable"
            ],
            "style": {
              "color": "#6f42c1"
            }
          },
          {
            "types": [
              "tag",
              "selector",
              "keyword"
            ],
            "style": {
              "color": "#00009f"
            }
          }
        ]
      },
      "additionalLanguages": [],
      "magicComments": [
        {
          "className": "theme-code-block-highlighted-line",
          "line": "highlight-next-line",
          "block": {
            "start": "highlight-start",
            "end": "highlight-end"
          }
        }
      ]
    },
    "docs": {
      "versionPersistence": "localStorage",
      "sidebar": {
        "hideable": false,
        "autoCollapseCategories": false
      }
    },
    "metadata": []
  },
  "baseUrlIssueBanner": true,
  "onDuplicateRoutes": "warn",
  "staticDirectories": [
    "static"
  ],
  "themes": [],
  "scripts": [],
  "headTags": [],
  "stylesheets": [],
  "clientModules": [],
  "titleDelimiter": "|",
  "noIndex": false,
  "markdown": {
    "mermaid": false
  }
};
