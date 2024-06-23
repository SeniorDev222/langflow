module.exports = {
  docs: [
    {
      type: "category",
      label: "What's New?",
      collapsed: false,
      items: ["whats-new/a-new-chapter-langflow"],
    },
    {
      type: "category",
      label: "Getting Started",
      collapsed: false,
      items: [
        "index",
        "getting-started/install-langflow",
        "getting-started/quickstart",
        "getting-started/workspace",
        "migration/possible-installation-issues",
        "getting-started/new-to-llms",
      ],
    },
    {
      type: "category",
      label: "Starter Projects",
      collapsed: false,
      items: [
        "starter-projects/basic-prompting",
        "starter-projects/blog-writer",
        "starter-projects/document-qa",
        "starter-projects/memory-chatbot",
        "starter-projects/vector-store-rag",
      ],
    },
    {
      type: "category",
      label: "Administration",
      collapsed: false,
      items: [
        "administration/api",
        "administration/login",
        "administration/cli",
        "administration/playground",
        "administration/memories",
        "administration/collections-projects",
        "administration/settings",
        "administration/global-env",
        "administration/chat-widget",
      ],
    },
    {
      type: "category",
      label: "Core Components",
      collapsed: false,
      items: [
        "components/inputs-and-outputs",
        "components/text-and-record",
        "components/data",
        "components/models",
        "components/helpers",
        "components/vector-stores",
        "components/embeddings",
        "components/custom",
      ],
    },
    {
      type: "category",
      label: "Extended Components",
      collapsed: true,
      items: [
        "components/agents",
        "components/chains",
        "components/experimental",
        "components/utilities",
        "components/model_specs",
        "components/retrievers",
        "components/text-splitters",
        "components/toolkits",
        "components/tools",
      ],
    },
    {
      type: "category",
      label: "Example Components",
      collapsed: true,
      items: [
        "examples/chat-memory",
        "examples/combine-text",
        "examples/create-record",
        "examples/pass",
        "examples/store-message",
        "examples/sub-flow",
        "examples/text-operator",
      ],
    },
    {
      type: "category",
      label: "Migration",
      collapsed: false,
      items: [
        "migration/migrating-to-one-point-zero",
        "migration/compatibility",
      ],
    },
    {
      type: "category",
      label: "Tutorials",
      collapsed: true,
      items: [
        "tutorials/chatprompttemplate_guide",
        "tutorials/custom_components",
        "tutorials/loading_document",
        "tutorials/rag-with-astradb",
      ],
    },
    {
      type: "category",
      label: "Deployment",
      collapsed: true,
      items: [
        "deployment/docker",
        "deployment/backend-only",
        "deployment/kubernetes",
        "deployment/gcp-deployment",
      ],
    },
    {
      type: "category",
      label: "Contributing",
      collapsed: false,
      items: [
        "contributing/telemetry",
        "contributing/how-contribute",
        "contributing/github-issues",
        "contributing/community",
        "contributing/contribute-component",
      ],
    },
    {
      type: "category",
      label: "Integrations",
      collapsed: false,
      items: [
        {
          type: "category",
          label: "Notion",
          items: [
            "integrations/notion/intro",
            "integrations/notion/setup",
            "integrations/notion/search",
            "integrations/notion/list-database-properties",
            "integrations/notion/list-pages",
            "integrations/notion/list-users",
            "integrations/notion/page-create",
            "integrations/notion/add-content-to-page",
            "integrations/notion/page-update",
            "integrations/notion/page-content-viewer",
          ],
        },
      ],
    },
  ],
};
