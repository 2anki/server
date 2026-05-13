import unittest
from helpers.io_shapes import float_to_display, shapes_to_occlusion_field


class TestFloatToDisplay(unittest.TestCase):
    def test_zero(self):
        self.assertEqual(float_to_display(0), "0")

    def test_half(self):
        self.assertEqual(float_to_display(0.5), ".5")

    def test_four_decimal(self):
        self.assertEqual(float_to_display(0.2325), ".2325")

    def test_one(self):
        self.assertEqual(float_to_display(1.0), "1")

    def test_trailing_zeros_stripped(self):
        self.assertEqual(float_to_display(0.25), ".25")

    def test_integer_value(self):
        self.assertEqual(float_to_display(2.0), "2")


def _rect(x=0.1, y=0.2, w=0.3, h=0.15, label="", shape="rect", **kwargs):
    return {"x": x, "y": y, "w": w, "h": h, "label": label, "shape": shape, **kwargs}


class TestShapesToOcclusionField(unittest.TestCase):

    # ── rect ──────────────────────────────────────────────────────────────────

    def test_rect_ordinal_starts_at_one(self):
        result = shapes_to_occlusion_field([_rect()])
        self.assertIn("{{c1::", result)

    def test_rect_uses_normalized_coords_directly(self):
        result = shapes_to_occlusion_field([_rect(x=0.2, y=0.3, w=0.4, h=0.15)])
        self.assertIn("left=.2", result)
        self.assertIn("top=.3", result)
        self.assertIn("width=.4", result)
        self.assertIn("height=.15", result)

    def test_rect_oi_flag_present(self):
        result = shapes_to_occlusion_field([_rect()], occlude_inactive=True)
        self.assertIn(":oi=1", result)

    def test_rect_oi_flag_absent(self):
        result = shapes_to_occlusion_field([_rect()], occlude_inactive=False)
        self.assertNotIn(":oi=1", result)

    def test_rect_type_in_output(self):
        result = shapes_to_occlusion_field([_rect()])
        self.assertIn("image-occlusion:rect:", result)

    def test_ordinals_increment_across_shapes(self):
        shapes = [_rect(), _rect(x=0.5)]
        result = shapes_to_occlusion_field(shapes)
        self.assertIn("{{c1::", result)
        self.assertIn("{{c2::", result)

    def test_no_label_means_no_text_annotation(self):
        result = shapes_to_occlusion_field([_rect(label="")])
        self.assertNotIn("c0::", result)

    # ── ellipse ───────────────────────────────────────────────────────────────

    def test_ellipse_type_in_output(self):
        result = shapes_to_occlusion_field([_rect(shape="ellipse")])
        self.assertIn("image-occlusion:ellipse:", result)

    def test_ellipse_rx_ry_are_half_w_h(self):
        result = shapes_to_occlusion_field([_rect(w=0.4, h=0.2, shape="ellipse")])
        self.assertIn("rx=.2", result)
        self.assertIn("ry=.1", result)

    def test_ellipse_left_top_match_x_y(self):
        result = shapes_to_occlusion_field([_rect(x=0.1, y=0.3, shape="ellipse")])
        self.assertIn("left=.1", result)
        self.assertIn("top=.3", result)

    # ── polygon ───────────────────────────────────────────────────────────────

    def test_polygon_type_in_output(self):
        pts = [{"x": 0.1, "y": 0.1}, {"x": 0.5, "y": 0.1}, {"x": 0.3, "y": 0.4}]
        result = shapes_to_occlusion_field([_rect(shape="polygon", points=pts)])
        self.assertIn("image-occlusion:polygon:", result)

    def test_polygon_has_left_and_top(self):
        pts = [{"x": 0.2, "y": 0.3}, {"x": 0.5, "y": 0.3}, {"x": 0.35, "y": 0.5}]
        result = shapes_to_occlusion_field([_rect(x=0.2, y=0.3, shape="polygon", points=pts)])
        self.assertIn("left=.2", result)
        self.assertIn("top=.3", result)

    def test_polygon_points_serialized(self):
        pts = [{"x": 0.1, "y": 0.2}, {"x": 0.5, "y": 0.3}]
        result = shapes_to_occlusion_field([_rect(shape="polygon", points=pts)])
        self.assertIn(".1,.2", result)
        self.assertIn(".5,.3", result)

    # ── groups ────────────────────────────────────────────────────────────────

    def test_grouped_shapes_share_ordinal(self):
        shapes = [
            _rect(x=0.1, groupId="g1"),
            _rect(x=0.5, groupId="g1"),
        ]
        result = shapes_to_occlusion_field(shapes)
        self.assertEqual(result.count("{{c1::"), 2)
        self.assertNotIn("{{c2::", result)

    def test_ungrouped_shapes_get_own_ordinals(self):
        shapes = [_rect(x=0.1), _rect(x=0.5)]
        result = shapes_to_occlusion_field(shapes)
        self.assertIn("{{c1::", result)
        self.assertIn("{{c2::", result)

    def test_mixed_grouped_and_ungrouped(self):
        shapes = [
            _rect(x=0.1, groupId="g1"),
            _rect(x=0.3, groupId="g1"),
            _rect(x=0.6),
        ]
        result = shapes_to_occlusion_field(shapes)
        lines = result.strip().split("\n")
        self.assertEqual(len(lines), 3)
        self.assertIn("{{c1::", lines[0])
        self.assertIn("{{c1::", lines[1])
        self.assertIn("{{c2::", lines[2])


if __name__ == "__main__":
    unittest.main()
