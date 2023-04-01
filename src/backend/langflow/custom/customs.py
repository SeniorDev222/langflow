from langflow.template import nodes

CUSTOM_NODES = {
    "prompts": {"ZeroShotPrompt": nodes.ZeroShotPromptNode()},
    "tools": {"PythonFunction": nodes.PythonFunctionNode(), "Tool": nodes.ToolNode()},
    "agents": {
        "JsonAgent": nodes.JsonAgentNode(),
        "CSVAgent": nodes.CSVAgentNode(),
        "InitializeAgent": nodes.InitializeAgentNode(),
    },
}


def get_custom_nodes(node_type: str):
    """Get custom nodes."""
    return CUSTOM_NODES.get(node_type, {})
