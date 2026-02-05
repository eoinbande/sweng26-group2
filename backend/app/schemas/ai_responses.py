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



