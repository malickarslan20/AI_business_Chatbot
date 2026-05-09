from functools import lru_cache
from langchain_groq import ChatGroq
from langchain_core.messages import SystemMessage
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode

from config import get_settings
from agents.state import AgentState
from agents.tools.email_tools import EMAIL_TOOLS
from agents.tools.invoice_tools import INVOICE_TOOLS
from agents.tools.task_tools import TASK_TOOLS

# All tools the agent can use
ALL_TOOLS = EMAIL_TOOLS + INVOICE_TOOLS + TASK_TOOLS

SYSTEM_PROMPT = """You are an AI Business Operations Assistant.
You help manage emails, invoices, tasks, and business data.

You have access to tools for:
- Reading and syncing emails from Gmail
- Sending emails to recipients
- Listing, viewing, and managing invoices
- Marking invoices as paid
- Sending invoices to clients

Rules:
- Always use a tool when you need real data — never guess or make up IDs.
- After using a tool, summarize the result clearly for the user.
- If the user asks for multiple things, handle them one step at a time.
- Be concise and professional.
"""


@lru_cache(maxsize=None)
def get_llm():
    """
    Returns the Groq LLM with all tools bound.
    Cached — only created once for the life of the app.
    """
    settings = get_settings()
    llm = ChatGroq(
        model="llama-3.1-8b-instant",
        api_key=settings.groq_api_key,
        temperature=0,       # 0 = deterministic, best for tool use
        max_tokens=2048,
    )
    return llm.bind_tools(ALL_TOOLS)


# ── Graph nodes ───────────────────────────────────────────────

def llm_node(state: AgentState) -> dict:
    """
    Calls the LLM with the current conversation history.
    The LLM either:
      a) Returns a text answer → graph goes to END
      b) Returns tool_calls    → graph goes to tool_node
    """
    # Prepend system message + existing conversation
    messages = [SystemMessage(content=SYSTEM_PROMPT)] + state["messages"]
    response = get_llm().invoke(messages)
    return {"messages": [response]}


def should_continue(state: AgentState) -> str:
    """
    Conditional edge — decides where to go after llm_node.
    Reads the last message:
      - Has tool_calls? → go to 'tools' node
      - No tool_calls?  → go to END (return answer to user)
    """
    last_message = state["messages"][-1]
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"
    return END


# ── Build graph ───────────────────────────────────────────────

@lru_cache(maxsize=None)
def build_graph():
    """
    Assembles and compiles the LangGraph StateGraph.
    Cached — compilation is expensive, only done once.

    Graph structure:
        START → llm_node → (tool_node → llm_node)* → END
    """
    graph = StateGraph(AgentState)

    # Add nodes
    graph.add_node("llm", llm_node)
    graph.add_node("tools", ToolNode(ALL_TOOLS))

    # Edges
    graph.add_edge(START, "llm")
    graph.add_conditional_edges(
        "llm",
        should_continue,
        {"tools": "tools", END: END}
    )
    graph.add_edge("tools", "llm")  # after tool runs, go back to LLM

    return graph.compile()