"""
Helpers for generating Anki 23.10 Image Occlusion cloze fields from shape data.
"""


def float_to_display(value: float) -> str:
    s = f"{value:.4f}".lstrip("0") or "0"
    s = s.rstrip("0").rstrip(".")
    return s if s else "0"


def _rect_cloze(ordinal: int, shape: dict, oi_suffix: str) -> str:
    left = float_to_display(shape["x"])
    top = float_to_display(shape["y"])
    width = float_to_display(shape["w"])
    height = float_to_display(shape["h"])
    return f"{{{{c{ordinal}::image-occlusion:rect:left={left}:top={top}:width={width}:height={height}{oi_suffix}}}}}<br>"


def _ellipse_cloze(ordinal: int, shape: dict, oi_suffix: str) -> str:
    rx = float_to_display(shape["w"] / 2)
    ry = float_to_display(shape["h"] / 2)
    left = float_to_display(shape["x"])
    top = float_to_display(shape["y"])
    return f"{{{{c{ordinal}::image-occlusion:ellipse:left={left}:top={top}:rx={rx}:ry={ry}{oi_suffix}}}}}<br>"


def _polygon_cloze(ordinal: int, shape: dict, oi_suffix: str) -> str:
    points = shape.get("points") or []
    pts_str = " ".join(
        f"{float_to_display(p['x'])},{float_to_display(p['y'])}" for p in points
    )
    return f"{{{{c{ordinal}::image-occlusion:polygon:points={pts_str}{oi_suffix}}}}}<br>"


def shapes_to_occlusion_field(shapes, occlude_inactive: bool = True) -> str:
    oi_suffix = ":oi=1" if occlude_inactive else ""

    # Assign ordinals — shapes sharing a groupId share an ordinal (one card per group)
    group_ordinals: dict[str, int] = {}
    next_ordinal = 1
    shape_ordinals: list[int] = []
    for shape in shapes:
        group_id = shape.get("groupId")
        if group_id:
            if group_id not in group_ordinals:
                group_ordinals[group_id] = next_ordinal
                next_ordinal += 1
            shape_ordinals.append(group_ordinals[group_id])
        else:
            shape_ordinals.append(next_ordinal)
            next_ordinal += 1

    lines = []
    for shape, ordinal in zip(shapes, shape_ordinals):
        shape_type = shape.get("shape", "rect")
        if shape_type == "ellipse":
            lines.append(_ellipse_cloze(ordinal, shape, oi_suffix))
        elif shape_type == "polygon":
            lines.append(_polygon_cloze(ordinal, shape, oi_suffix))
        else:
            lines.append(_rect_cloze(ordinal, shape, oi_suffix))

    return "\n".join(lines)
