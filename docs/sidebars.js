module.exports = {
  docs: [
    {
      type: "category",
      label: " Getting Started",
      collapsed: false,
      items: [
        "index",
        "getting-started/cli",
        "getting-started/hugging-face-spaces",
        "getting-started/creating-flows",
      ],
    },
    {
      type: "category",
      label: " What's New",
      collapsed: false,
      items: [
        "whats-new/a-new-chapter-langflow",
        "whats-new/migrating-to-one-point-zero",
      ],
    },
    {
      type: "category",
      label: " Step-by-Step Guides",
      collapsed: false,
      items: [
        "guides/rag-with-astradb",
        "guides/async-tasks",
        "guides/loading_document",
        "guides/chatprompttemplate_guide",
        "guides/langfuse_integration",
      ],
    },
    {
      type: "category",
      label: "Migration Guides",
      collapsed: false,
      items: [
        "migration/flow-of-data",
        "migration/inputs-and-outputs",
        "migration/supported-frameworks",
        "migration/sidebar-and-interaction-panel",
        "migration/new-categories-and-components",
        "migration/text-and-record",
        "migration/custom-component",
        "migration/compatibility",
        "migration/multiple-flows",
        "migration/component-status-and-data-passing",
        "migration/connecting-output-components",
        "migration/renaming-and-editing-components",
        "migration/passing-tweaks-and-inputs",
        "migration/global-variables",
        "migration/experimental-components",
        "migration/state-management",
      ],
    },
    {
      type: "category",
      label: "Guidelines",
      collapsed: false,
      items: [
        "guidelines/login",
        "guidelines/api",
        "guidelines/async-api",
        "guidelines/components",
        "guidelines/features",
        "guidelines/collection",
        "guidelines/prompt-customization",
        "guidelines/chat-interface",
        "guidelines/chat-widget",
        "guidelines/custom-component",
      ],
    },
    {
      type: "category",
      label: "Component Reference",
      collapsed: false,
      items: [
        "components/inputs",
        "components/outputs",
        "components/data",
        "components/prompts",
        "components/models",
        "components/helpers",
        "components/experimental",
        "components/agents",
        "components/chains",
        "components/custom",
        "components/embeddings",
        "components/model_specs",
        "components/loaders",
        "components/memories",
        "components/prompts",
        "components/retrievers",
        "components/text-splitters",
        "components/toolkits",
        "components/tools",
        "components/utilities",
        "components/vector-stores",
        "components/wrappers",
      ],
    },
    {
      type: "category",
      label: "Examples",
      collapsed: false,
      items: [
        "examples/flow-runner",
        "examples/conversation-chain",
        "examples/buffer-memory",
        "examples/midjourney-prompt-chain",
        "examples/csv-loader",
        "examples/searchapi-tool",
        "examples/serp-api-tool",
        "examples/multiple-vectorstores",
        "examples/python-function",
        "examples/how-upload-examples",
      ],
    },
    {
      type: "category",
      label: "Deployment",
      collapsed: false,
      items: ["deployment/gcp-deployment"],
    },
    {
      type: "category",
      label: "Contributing",
      collapsed: false,
      items: [
        "contributing/how-contribute",
        "contributing/github-issues",
        "contributing/community",
      ],
    },
  ],
};
