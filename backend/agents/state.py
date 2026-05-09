from typing import Annotated
from typing_extensions import TypedDict
from langgraph.graph.message import add_messages


class AgentState(TypedDict):
    """
    The shared state object that flows through every LangGraph node.

    Fields:
        messages : Full conversation history.
                   add_messages annotation means new messages are
                   APPENDED, not replacing the old list.
        context  : Optional extra data passed to the agent
                   e.g. {"email_id": "uuid", "invoice_id": "uuid"}
                   The LLM can read this for context-aware responses.
    """
    messages: Annotated[list, add_messages]
    context:  dict