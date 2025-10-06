# answer correctness, question type, original proficiency -> new proficiency

import math
import os

def adjust_proficiency(current_level: float, score: float, q_type: str) -> float:

    # ---- Base learning rate (higher for lower levels) ----
    base_lr = 0.05 * (1 - current_level)  # diminishing gains as proficiency rises

    # ---- Type weighting ----
    type_weight = 1.0 if q_type == "structured" else 0.6

    # ---- Correctness influence ----
    delta = (score - 0.5) * 2  # range -1 → +1
    # positive delta if score > 0.5, negative if < 0.5

    # ---- Sensitivity shaping ----
    # For perfect performance, progress by ~0.03–0.05 per question early on
    # such that 20–30 questions can reach 1.0
    change = base_lr * type_weight * delta

    # ---- Penalty scaling: harsher for higher levels when wrong ----
    if delta < 0 and current_level > 0.6:
        change *= 1.5

    # ---- Update and clamp ----
    new_level = current_level + change
    new_level = max(0.0, min(1.0, new_level))
    return round(new_level, 4)
