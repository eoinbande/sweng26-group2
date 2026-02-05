from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, Any
from datetime import datetime
from enum import Enum
import uuid

# =============================================================================
# ENUMS
# =============================================================================

class GoalType(str, Enum):
    """
    Three workflow types:
    - SPECIFIC: Linear goals with sequential tasks (e.g., "fix my bike tire")
    - GENERAL: Branching goals with parallel tasks (e.g., "plan a wedding")
    - HABIT: Cyclical goals that repeat (e.g., "morning exercise routine")
    """
    SPECIFIC = "SPECIFIC"
    GENERAL = "GENERAL"
    HABIT = "HABIT"

class TaskStatus(str, Enum):
    """Status of individual task nodes."""
    NOT_STARTED = "not_started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"

class EdgeType(str, Enum):
    """
    Explicit edge types:
    - ORDERING: "Do this, then that" (sequential)
    - SUBTASK: Parent-child relationship (hierarchical)
    - DEPENDENCY: "Task B requires Task A" (hard requirement)
    """
    ORDERING = "ordering"
    SUBTASK = "subtask"
    DEPENDENCY = "dependency"

class NodeType(str, Enum):
    """
    Node types:
    - TASK: Individual actionable step
    - LIST: Container for sub-tasks (allows nesting)
    """
    TASK = "task"
    LIST = "list"


# =============================================================================
# NODE SCHEMA (Tasks)
# =============================================================================

class TaskNode(BaseModel):
    """
    Represents a single node in the goal graph.
    
    Kept flexible - most fields are optional.
    Required fields: id, task
    
    Example:
        {
            "id": "task_1",
            "task": "Remove wheel from bike",
            "status": "completed",
            "est_time": 10
        }
    """
    # Required fields
    id: str = Field(
        ...,
        description="Unique identifier for the task"
    )
    task: str = Field(
        ...,
        description="The task description - what the user needs to do"
    )

    # Core optional fields
    node_type: NodeType = Field(
        default=NodeType.TASK,
        description="Type of node: task or list (container)"
    )
    status: TaskStatus = Field(
        default=TaskStatus.NOT_STARTED,
        description="Current status of the task"
    )
    est_time: Optional[int] = Field(
        default=None,
        description="Estimated time to complete in minutes"
    )

    # Timestamps - all optional for flexibility
    created_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    # Relationship fields (optional)
    parent_task: Optional[str] = Field(
        default=None,
        description="ID of parent task if this is a subtask"
    )
    has_subtasks: Optional[bool] = Field(
        default=None,
        description="True if this task has been expanded into subtasks"
    )

    # Adaptation fields for HABIT goals (optional)
    is_adaptation: Optional[bool] = None
    adapted: Optional[bool] = None
    
    # Feedback fields (optional)
    stuck_reason: Optional[str] = None

    # FLEXIBLE: Allow any additional fields the frontend/AI might need
    # This aligns with "be unopinionated" and "JSON totally mutable"
    extra: Optional[dict[str, Any]] = Field(
        default=None,
        description="Flexible field for any additional data needed"
    )

    # Allow extra fields to be passed through (unopinionated approach)
    model_config = ConfigDict(extra="allow")

    @field_validator('id')
    @classmethod
    def validate_task_id(cls, v: str) -> str:
        if not v or len(v.strip()) == 0:
            raise ValueError("Task ID cannot be empty")
        return v.strip()
    

# =============================================================================
# EDGE SCHEMA (Relationships between tasks)
# =============================================================================

class Edge(BaseModel):
    """
    Represents a directed relationship between two task nodes.
    
    Edge direction: head -> tail (head comes before/contains tail)
    
    Includes explicit edge_type:
    - ordering: "Do this, then that"
    - subtask: Parent-child relationship
    - dependency: Hard requirement
    
    Example:
        {"head": "task_1", "tail": "task_2", "edge_type": "ordering"}
    """
    head: str = Field(
        ...,
        description="Source task ID"
    )
    tail: str = Field(
        ...,
        description="Target task ID"
    )

    # Optional: allows explicit typing but doesn't require it
    # Sample mocks don't use edge_type, so we keep it optional for compatibility
    edge_type: Optional[EdgeType] = Field(
        default=None,
        description="Type of relationship: ordering, subtask, or dependency. Optional for flexibility."
    )

    model_config = ConfigDict(extra="allow")

    @field_validator('head', 'tail')
    @classmethod
    def validate_edge_ids(cls, v: str) -> str:
        if not v or len(v.strip()) == 0:
            raise ValueError("Edge task IDs cannot be empty")
        return v.strip()
    

# =============================================================================
# GOAL SCHEMA (Container for nodes and edges)
# =============================================================================

class GoalData(BaseModel):
    """
    The complete goal structure stored as JSON in the database.
        
    This entire object is stored in the `goal_data` JSONB column.
    Kept flexible - only goal_id, user_id, title, nodes are truly required.
    """

    # Required fields
    goal_id: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        description="Unique identifier for the goal"
    )
    user_id: str = Field(
        ...,
        description="ID of the user who owns this goal"
    )
    title: str = Field(
        ...,
        description="The user's original goal input"
    )
    nodes: list[TaskNode] = Field(
        default_factory=list,
        description="List of all task nodes in the goal"
    )
    edges: list[Edge] = Field(
        default_factory=list,
        description="List of edges defining task relationships"
    )

    # Optional 
    goal_type: Optional[GoalType] = Field(
        default=None,
        description="Type of goal: SPECIFIC, GENERAL, or HABIT"
    )
    created_at: Optional[datetime] = Field(
        default_factory=datetime.utcnow
    )
    updated_at: Optional[datetime] = Field(
        default_factory=datetime.utcnow
    )

    # HABIT-specific fields (all optional)
    iteration: Optional[int] = None
    streak: Optional[int] = None
    previous_iteration_id: Optional[str] = None

    # FLEXIBLE: Allow any additional fields
    extra: Optional[dict[str, Any]] = Field(
        default=None,
        description="Flexible field for any additional data"
    )

    model_config = ConfigDict(extra="allow")


     # -------------------------------------------------------------------------
    # Helper Methods
    # -------------------------------------------------------------------------

    def get_node_by_id(self, task_id: str) -> Optional[TaskNode]:
        """Find a node by its ID."""
        for node in self.nodes:
            if node.id == task_id:
                return node
        return None
    
    def get_children(self, task_id: str) -> list[TaskNode]:
        """Get all direct children of a task (via subtask edges)."""
        child_ids = [
            edge.tail for edge in self.edges 
            if edge.head == task_id and edge.edge_type == EdgeType.SUBTASK
        ]
        return [node for node in self.nodes if node.id in child_ids]
    
    def get_next_tasks(self, task_id: str) -> list[TaskNode]:
        """Get tasks that come after this one (via ordering edges or untyped edges)."""
        next_ids = [
            edge.tail for edge in self.edges 
            if edge.head == task_id and edge.edge_type in [EdgeType.ORDERING, None]
        ]
        return [node for node in self.nodes if node.id in next_ids]
    
    def get_available_tasks(self) -> list[TaskNode]:
        """
        Get tasks that are available to work on now.
        
        A task is available if:
        - All its dependencies (DEPENDENCY edges) are completed
        - All its ordering predecessors (ORDERING edges or untyped edges) are completed
        - It's not already completed
        
        For GENERAL goals, multiple tasks can be available simultaneously.
        """
        blocked_tasks = set()
        
        for edge in self.edges:
            # For ordering, dependency, or untyped edges, check if predecessor is done
            # Treat None (untyped) as ordering edge for backwards compatibility
            if edge.edge_type in [EdgeType.ORDERING, EdgeType.DEPENDENCY, None]:
                head_node = self.get_node_by_id(edge.head)
                if head_node and head_node.status != TaskStatus.COMPLETED:
                    blocked_tasks.add(edge.tail)
        
        return [
            node for node in self.nodes
            if node.id not in blocked_tasks 
            and node.status != TaskStatus.COMPLETED
            and node.node_type == NodeType.TASK  # Don't return LIST nodes as workable
        ]
    
    def validate_graph(self) -> list[str]:
        """
        Validate the graph structure. Returns list of warnings/errors.
        Useful for testing and debugging.
        """
        issues = []
        node_ids = {node.id for node in self.nodes}
        
        # Check for duplicate node IDs
        if len(node_ids) != len(self.nodes):
            issues.append("Duplicate node IDs found")
        
        # Check edges reference valid nodes
        for edge in self.edges:
            if edge.head not in node_ids:
                issues.append(f"Edge references non-existent head: {edge.head}")
            if edge.tail not in node_ids:
                issues.append(f"Edge references non-existent tail: {edge.tail}")
        
        # Check for self-loops
        for edge in self.edges:
            if edge.head == edge.tail:
                issues.append(f"Self-loop detected: {edge.head}")
        
        return issues
    

# =============================================================================
# AI RESPONSE SCHEMAS
# =============================================================================

class AIGeneratePlanResponse(BaseModel):
    """
    Schema for AI response when generating a new plan from a goal.
    
    Kept minimal - AI just needs to return the graph structure.
    """
    goal_type: GoalType = Field(
        ...,
        description="AI-determined goal type"
    )
    nodes: list[TaskNode] = Field(
        ...,
        description="Generated task nodes",
        min_length=1
    )
    edges: list[Edge] = Field(
        default_factory=list,
        description="Edges defining task relationships"
    )

    model_config = ConfigDict(extra="allow")

class AIExpandTaskResponse(BaseModel):
    """
    Schema for AI response when user clicks "I'm stuck" on a task.
    """
    original_task_id: str
    new_nodes: list[TaskNode] = Field(..., min_length=1)
    new_edges: list[Edge]
    edges_to_remove: list[Edge] = Field(default_factory=list)

    model_config = ConfigDict(extra="allow")

class AIAdaptTaskResponse(BaseModel):
    """
    Schema for adapting a task (especially for HABIT goals).
    """
    original_task_id: str
    adaptations: list[TaskNode] = Field(..., min_length=1)
    new_edges: list[Edge]
    edges_to_remove: list[Edge] = Field(default_factory=list)

    model_config = ConfigDict(extra="allow")




