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


