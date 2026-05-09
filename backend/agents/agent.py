from langchain_core.messages import HumanMessage, AIMessage
from agents.graph import build_graph
from agents.state import AgentState


def run(user_message: str, context: dict = {}) -> str:
    """
    Run the AI agent with a user message and return the final response.

    This is the main function the chatbot router will call.
    It handles the full LangGraph loop internally.

    Args:
        user_message : The user's input text.
        context      : Optional extra context dict e.g.
                       {"email_id": "uuid", "invoice_id": "uuid"}

    Returns:
        The agent's final text response as a string.
    """
    graph = build_graph()

    initial_state: AgentState = {
        "messages": [HumanMessage(content=user_message)],
        "context":  context,
    }

    result = graph.invoke(initial_state)

    # The final answer is always the last message in the state
    last_message = result["messages"][-1]

    # Extract text content from AIMessage
    if isinstance(last_message, AIMessage):
        return last_message.content
    return str(last_message.content)


async def stream(user_message: str, context: dict = {}):
    """
    Stream the agent response token by token.
    Used by the WebSocket endpoint in chatbot_router (Phase 5).

    Yields:
        str chunks of the response as they arrive.
    """
    graph = build_graph()

    initial_state: AgentState = {
        "messages": [HumanMessage(content=user_message)],
        "context":  context,
    }

    async for event in graph.astream_events(initial_state, version="v2"):
        kind = event.get("event", "")
        # Only stream LLM text tokens, skip tool call events
        if kind == "on_chat_model_stream":
            chunk = event.get("data", {}).get("chunk")
            if chunk and hasattr(chunk, "content") and chunk.content:
                yield chunk.content