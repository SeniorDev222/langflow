import json
from langflow.graph.nodes import (
    WrapperNode,
    AgentNode,
    ToolNode,
    ChainNode,
    PromptNode,
    LLMNode,
    ToolkitNode,
    FileToolNode,
)

import pytest
from langchain.agents import AgentExecutor
from langflow.graph import Edge, Graph, Node
from langflow.utils.payload import build_json, get_root_node


# Test cases for the graph module

# now we have three types of graph:
# BASIC_EXAMPLE_PATH, COMPLEX_EXAMPLE_PATH, OPENAPI_EXAMPLE_PATH


def get_graph(_type="basic"):
    """Get a graph from a json file"""
    if _type == "basic":
        path = pytest.BASIC_EXAMPLE_PATH
    elif _type == "complex":
        path = pytest.COMPLEX_EXAMPLE_PATH
    elif _type == "openapi":
        path = pytest.OPENAPI_EXAMPLE_PATH

    with open(path, "r") as f:
        flow_graph = json.load(f)
    data_graph = flow_graph["data"]
    nodes = data_graph["nodes"]
    edges = data_graph["edges"]
    return Graph(nodes, edges)


@pytest.fixture
def basic_graph():
    return get_graph()


@pytest.fixture
def complex_graph():
    return get_graph("complex")


@pytest.fixture
def openapi_graph():
    return get_graph("openapi")


def get_node_by_type(graph, node_type):
    """Get a node by type"""
    return next((node for node in graph.nodes if isinstance(node, node_type)), None)


def test_graph_structure(basic_graph):
    assert isinstance(basic_graph, Graph)
    assert len(basic_graph.nodes) > 0
    assert len(basic_graph.edges) > 0
    for node in basic_graph.nodes:
        assert isinstance(node, Node)
    for edge in basic_graph.edges:
        assert isinstance(edge, Edge)
        assert edge.source in basic_graph.nodes
        assert edge.target in basic_graph.nodes


def test_circular_dependencies(basic_graph):
    assert isinstance(basic_graph, Graph)

    def check_circular(node, visited):
        visited.add(node)
        neighbors = basic_graph.get_nodes_with_target(node)
        for neighbor in neighbors:
            if neighbor in visited:
                return True
            if check_circular(neighbor, visited.copy()):
                return True
        return False

    for node in basic_graph.nodes:
        assert not check_circular(node, set())


def test_invalid_node_types():
    graph_data = {
        "nodes": [
            {
                "id": "1",
                "data": {
                    "node": {
                        "base_classes": ["BaseClass"],
                        "template": {
                            "_type": "InvalidNodeType",
                        },
                    },
                },
            },
        ],
        "edges": [],
    }
    with pytest.raises(Exception):
        Graph(graph_data["nodes"], graph_data["edges"])


def test_get_nodes_with_target(basic_graph):
    """Test getting connected nodes"""
    assert isinstance(basic_graph, Graph)
    # Get root node
    root = get_root_node(basic_graph)
    assert root is not None
    connected_nodes = basic_graph.get_nodes_with_target(root)
    assert connected_nodes is not None


def test_get_node_neighbors_basic(basic_graph):
    """Test getting node neighbors"""

    assert isinstance(basic_graph, Graph)
    # Get root node
    root = get_root_node(basic_graph)
    assert root is not None
    neighbors = basic_graph.get_node_neighbors(root)
    assert neighbors is not None
    assert isinstance(neighbors, dict)
    # Root Node is an Agent, it requires an LLMChain and tools
    # We need to check if there is a Chain in the one of the neighbors'
    # data attribute in the type key
    assert any(
        "Chain" in neighbor.data["type"] for neighbor, val in neighbors.items() if val
    )
    # assert Serper Search is in the neighbors
    assert any(
        "Serper" in neighbor.data["type"] for neighbor, val in neighbors.items() if val
    )
    # Now on to the Chain's neighbors
    chain = next(
        neighbor
        for neighbor, val in neighbors.items()
        if "Chain" in neighbor.data["type"] and val
    )
    chain_neighbors = basic_graph.get_node_neighbors(chain)
    assert chain_neighbors is not None
    assert isinstance(chain_neighbors, dict)
    # Check if there is a LLM in the chain's neighbors
    assert any(
        "OpenAI" in neighbor.data["type"]
        for neighbor, val in chain_neighbors.items()
        if val
    )
    # Chain should have a Prompt as a neighbor
    assert any(
        "Prompt" in neighbor.data["type"]
        for neighbor, val in chain_neighbors.items()
        if val
    )


def test_get_node_neighbors_complex(complex_graph):
    """Test getting node neighbors"""
    assert isinstance(complex_graph, Graph)
    # Get root node
    root = get_root_node(complex_graph)
    assert root is not None
    neighbors = complex_graph.get_nodes_with_target(root)
    assert neighbors is not None
    # Neighbors should be a list of nodes
    assert isinstance(neighbors, list)
    # Root Node is an Agent, it requires an LLMChain and tools
    # We need to check if there is a Chain in the one of the neighbors'
    assert any("Chain" in neighbor.data["type"] for neighbor in neighbors)
    # assert Tool is in the neighbors
    assert any("Tool" in neighbor.data["type"] for neighbor in neighbors)
    # Now on to the Chain's neighbors
    chain = next(neighbor for neighbor in neighbors if "Chain" in neighbor.data["type"])
    chain_neighbors = complex_graph.get_nodes_with_target(chain)
    assert chain_neighbors is not None
    # Check if there is a LLM in the chain's neighbors
    assert any("OpenAI" in neighbor.data["type"] for neighbor in chain_neighbors)
    # Chain should have a Prompt as a neighbor
    assert any("Prompt" in neighbor.data["type"] for neighbor in chain_neighbors)
    # Now on to the Tool's neighbors
    tool = next(neighbor for neighbor in neighbors if "Tool" in neighbor.data["type"])
    tool_neighbors = complex_graph.get_nodes_with_target(tool)
    assert tool_neighbors is not None
    # Check if there is an Agent in the tool's neighbors
    assert any("Agent" in neighbor.data["type"] for neighbor in tool_neighbors)
    # This Agent has a Tool that has a PythonFunction as func
    agent = next(
        neighbor for neighbor in tool_neighbors if "Agent" in neighbor.data["type"]
    )
    agent_neighbors = complex_graph.get_nodes_with_target(agent)
    assert agent_neighbors is not None
    # Check if there is a Tool in the agent's neighbors
    assert any("Tool" in neighbor.data["type"] for neighbor in agent_neighbors)
    # This Tool has a PythonFunction as func
    tool = next(
        neighbor for neighbor in agent_neighbors if "Tool" in neighbor.data["type"]
    )
    tool_neighbors = complex_graph.get_nodes_with_target(tool)
    assert tool_neighbors is not None
    # Check if there is a PythonFunction in the tool's neighbors
    assert any("PythonFunction" in neighbor.data["type"] for neighbor in tool_neighbors)


def test_get_node(basic_graph):
    """Test getting a single node"""
    node_id = basic_graph.nodes[0].id
    node = basic_graph.get_node(node_id)
    assert isinstance(node, Node)
    assert node.id == node_id


def test_build_nodes(basic_graph):
    """Test building nodes"""

    assert len(basic_graph.nodes) == len(basic_graph._nodes)
    for node in basic_graph.nodes:
        assert isinstance(node, Node)


def test_build_edges(basic_graph):
    """Test building edges"""
    assert len(basic_graph.edges) == len(basic_graph._edges)
    for edge in basic_graph.edges:
        assert isinstance(edge, Edge)
        assert isinstance(edge.source, Node)
        assert isinstance(edge.target, Node)


def test_get_root_node(basic_graph, complex_graph):
    """Test getting root node"""
    assert isinstance(basic_graph, Graph)
    root = get_root_node(basic_graph)
    assert root is not None
    assert isinstance(root, Node)
    assert root.data["type"] == "ZeroShotAgent"
    # For complex example, the root node is a ZeroShotAgent too
    assert isinstance(complex_graph, Graph)
    root = get_root_node(complex_graph)
    assert root is not None
    assert isinstance(root, Node)
    assert root.data["type"] == "ZeroShotAgent"


def test_build_json(basic_graph):
    """Test building JSON from graph"""
    assert isinstance(basic_graph, Graph)
    root = get_root_node(basic_graph)
    json_data = build_json(root, basic_graph)
    assert isinstance(json_data, dict)
    assert json_data["_type"] == "zero-shot-react-description"
    assert isinstance(json_data["llm_chain"], dict)
    assert json_data["llm_chain"]["_type"] == "llm_chain"
    assert json_data["llm_chain"]["memory"] is None
    assert json_data["llm_chain"]["verbose"] is False
    assert isinstance(json_data["llm_chain"]["prompt"], dict)
    assert isinstance(json_data["llm_chain"]["llm"], dict)
    assert json_data["llm_chain"]["output_key"] == "text"
    assert isinstance(json_data["allowed_tools"], list)
    assert all(isinstance(tool, dict) for tool in json_data["allowed_tools"])
    assert isinstance(json_data["return_values"], list)
    assert all(isinstance(val, str) for val in json_data["return_values"])


def test_validate_edges(basic_graph):
    """Test validating edges"""

    assert isinstance(basic_graph, Graph)
    # all edges should be valid
    assert all(edge.valid for edge in basic_graph.edges)


def test_matched_type(basic_graph):
    """Test matched type attribute in Edge"""
    assert isinstance(basic_graph, Graph)
    # all edges should be valid
    assert all(edge.valid for edge in basic_graph.edges)
    # all edges should have a matched_type attribute
    assert all(hasattr(edge, "matched_type") for edge in basic_graph.edges)
    # The matched_type attribute should be in the source_types attr
    assert all(edge.matched_type in edge.source_types for edge in basic_graph.edges)


def test_build_params(basic_graph):
    """Test building params"""

    assert isinstance(basic_graph, Graph)
    # all edges should be valid
    assert all(edge.valid for edge in basic_graph.edges)
    # all edges should have a matched_type attribute
    assert all(hasattr(edge, "matched_type") for edge in basic_graph.edges)
    # The matched_type attribute should be in the source_types attr
    assert all(edge.matched_type in edge.source_types for edge in basic_graph.edges)
    # Get the root node
    root = get_root_node(basic_graph)
    # Root node is a ZeroShotAgent
    # which requires an llm_chain, allowed_tools and return_values
    assert isinstance(root.params, dict)
    assert "llm_chain" in root.params
    assert "allowed_tools" in root.params
    assert "return_values" in root.params
    # The llm_chain should be a Node
    assert isinstance(root.params["llm_chain"], Node)
    # The allowed_tools should be a list of Nodes
    assert isinstance(root.params["allowed_tools"], list)
    assert all(isinstance(tool, Node) for tool in root.params["allowed_tools"])
    # The return_values is of type str so it should be a list of strings
    assert isinstance(root.params["return_values"], list)
    assert all(isinstance(val, str) for val in root.params["return_values"])
    # The llm_chain should have a prompt and llm
    llm_chain_node = root.params["llm_chain"]
    assert isinstance(llm_chain_node.params, dict)
    assert "prompt" in llm_chain_node.params
    assert "llm" in llm_chain_node.params
    # The prompt should be a Node
    assert isinstance(llm_chain_node.params["prompt"], Node)
    # The llm should be a Node
    assert isinstance(llm_chain_node.params["llm"], Node)
    # The prompt should have format_insctructions, suffix, prefix
    prompt_node = llm_chain_node.params["prompt"]
    assert isinstance(prompt_node.params, dict)
    assert "format_instructions" in prompt_node.params
    assert "suffix" in prompt_node.params
    assert "prefix" in prompt_node.params
    # All of them should be of type str
    assert isinstance(prompt_node.params["format_instructions"], str)
    assert isinstance(prompt_node.params["suffix"], str)
    assert isinstance(prompt_node.params["prefix"], str)
    # The llm should have a model
    llm_node = llm_chain_node.params["llm"]
    assert isinstance(llm_node.params, dict)
    assert "model_name" in llm_node.params
    # The model should be a str
    assert isinstance(llm_node.params["model_name"], str)


def test_build(basic_graph, complex_graph):
    """Test Node's build method"""
    # def build(self):
    # # The params dict is used to build the module
    # # it contains values and keys that point to nodes which
    # # have their own params dict
    # # When build is called, we iterate through the params dict
    # # and if the value is a node, we call build on that node
    # # and use the output of that build as the value for the param
    # # if the value is not a node, then we use the value as the param
    # # and continue
    # # Another aspect is that the node_type is the class that we need to import
    # # and instantiate with these built params

    # # Build each node in the params dict
    # for key, value in self.params.items():
    #     if isinstance(value, Node):
    #         self.params[key] = value.build()

    # # Get the class from LANGCHAIN_TYPES_DICT
    # # and instantiate it with the params
    # # and return the instance
    # return LANGCHAIN_TYPES_DICT[self.node_type](**self.params)

    assert isinstance(basic_graph, Graph)
    # Now we test the build method
    # Build the Agent
    agent = basic_graph.build()
    # The agent should be a AgentExecutor
    assert isinstance(agent, AgentExecutor)

    # Now we test the complex example
    assert isinstance(complex_graph, Graph)
    # Now we test the build method
    agent = complex_graph.build()
    # The agent should be a AgentExecutor
    assert isinstance(agent, AgentExecutor)


def test_agent_node_build(basic_graph):
    agent_node = get_node_by_type(basic_graph, AgentNode)
    assert agent_node is not None
    built_object = agent_node.build()
    assert built_object is not None
    # Add any further assertions specific to the AgentNode's build() method


def test_tool_node_build(basic_graph):
    tool_node = get_node_by_type(basic_graph, ToolNode)
    assert tool_node is not None
    built_object = tool_node.build()
    assert built_object is not None
    # Add any further assertions specific to the ToolNode's build() method


def test_chain_node_build(complex_graph):
    chain_node = get_node_by_type(complex_graph, ChainNode)
    assert chain_node is not None
    built_object = chain_node.build()
    assert built_object is not None
    # Add any further assertions specific to the ChainNode's build() method


def test_prompt_node_build(complex_graph):
    prompt_node = get_node_by_type(complex_graph, PromptNode)
    assert prompt_node is not None
    built_object = prompt_node.build()
    assert built_object is not None
    # Add any further assertions specific to the PromptNode's build() method


def test_llm_node_build(basic_graph):
    llm_node = get_node_by_type(basic_graph, LLMNode)
    assert llm_node is not None
    built_object = llm_node.build()
    assert built_object is not None
    # Add any further assertions specific to the LLMNode's build() method


def test_toolkit_node_build(openapi_graph):
    toolkit_node = get_node_by_type(openapi_graph, ToolkitNode)
    assert toolkit_node is not None
    built_object = toolkit_node.build()
    assert built_object is not None
    # Add any further assertions specific to the ToolkitNode's build() method


def test_file_tool_node_build(openapi_graph):
    file_tool_node = get_node_by_type(openapi_graph, FileToolNode)
    assert file_tool_node is not None
    built_object = file_tool_node.build()
    assert built_object is not None
    # Add any further assertions specific to the FileToolNode's build() method


def test_wrapper_node_build(openapi_graph):
    wrapper_node = get_node_by_type(openapi_graph, WrapperNode)
    assert wrapper_node is not None
    built_object = wrapper_node.build()
    assert built_object is not None
    # Add any further assertions specific to the WrapperNode's build() method
