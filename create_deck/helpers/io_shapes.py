"""
Helpers for generating Anki 23.10 Image Occlusion cloze fields from rect data.
"""


def float_to_display(value: float) -> str:
    s = f"{value:.4f}".lstrip("0") or "0"
    s = s.rstrip("0").rstrip(".")
    return s if s else "0"


def shapes_to_occlusion_field(shapes, img_w: int, img_h: int, occlude_inactive: bool = True) -> str:
    lines = []
    ordinal = 1
    oi_suffix = ":oi=1" if occlude_inactive else ""
    for shape in shapes:
        left = float_to_display(shape["x"] / img_w)
        top = float_to_display(shape["y"] / img_h)
        width = float_to_display(shape["w"] / img_w)
        height = float_to_display(shape["h"] / img_h)
        lines.append(
            f"{{{{c{ordinal}::image-occlusion:rect:left={left}:top={top}:width={width}:height={height}{oi_suffix}}}}}<br>"
        )
        if shape.get("label"):
            label = shape["label"].replace(":", "\\:")
            lines.append(
                f"{{{{c0::image-occlusion:text:text={label}:left={left}:top={top}:scale=1}}}}<br>"
            )
        ordinal += 1
    return "\n".join(lines)
