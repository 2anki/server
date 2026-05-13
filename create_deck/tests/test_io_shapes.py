import unittest
from helpers.io_shapes import float_to_display, shapes_to_occlusion_field


class TestFloatToDisplay(unittest.TestCase):
    def test_zero(self):
        self.assertEqual(float_to_display(0), "0")

    def test_half(self):
        self.assertEqual(float_to_display(0.5), ".5")

    def test_two_decimal(self):
        self.assertEqual(float_to_display(0.2325), ".2325")

    def test_one(self):
        self.assertEqual(float_to_display(1.0), "1")

    def test_trailing_zero_stripped(self):
        self.assertEqual(float_to_display(0.2500), ".25")

    def test_integer_value(self):
        self.assertEqual(float_to_display(2.0), "2")


class TestShapesToOcclusionField(unittest.TestCase):
    def _single_shape(self, **kwargs):
        defaults = {"x": 100, "y": 50, "w": 200, "h": 100, "label": ""}
        defaults.update(kwargs)
        return [defaults]

    def test_cloze_ordinal_starts_at_one(self):
        result = shapes_to_occlusion_field(self._single_shape(), 400, 200)
        self.assertIn("{{c1::", result)

    def test_ordinal_increments_per_shape(self):
        shapes = [
            {"x": 0, "y": 0, "w": 10, "h": 10, "label": ""},
            {"x": 20, "y": 20, "w": 10, "h": 10, "label": ""},
        ]
        result = shapes_to_occlusion_field(shapes, 100, 100)
        self.assertIn("{{c1::", result)
        self.assertIn("{{c2::", result)

    def test_oi_flag_present_when_occlude_inactive_true(self):
        result = shapes_to_occlusion_field(self._single_shape(), 400, 200, occlude_inactive=True)
        self.assertIn(":oi=1", result)

    def test_oi_flag_absent_when_occlude_inactive_false(self):
        result = shapes_to_occlusion_field(self._single_shape(), 400, 200, occlude_inactive=False)
        self.assertNotIn(":oi=1", result)

    def test_label_text_annotation(self):
        shapes = [{"x": 0, "y": 0, "w": 10, "h": 10, "label": "Heart"}]
        result = shapes_to_occlusion_field(shapes, 100, 100)
        self.assertIn("{{c0::image-occlusion:text:text=Heart:", result)

    def test_label_colon_escaped(self):
        shapes = [{"x": 0, "y": 0, "w": 10, "h": 10, "label": "A:B"}]
        result = shapes_to_occlusion_field(shapes, 100, 100)
        self.assertIn("text=A\\:B", result)

    def test_coordinate_normalization(self):
        shapes = [{"x": 200, "y": 100, "w": 400, "h": 200, "label": ""}]
        result = shapes_to_occlusion_field(shapes, 1000, 500)
        self.assertIn("left=.2", result)
        self.assertIn("top=.2", result)
        self.assertIn("width=.4", result)
        self.assertIn("height=.4", result)

    def test_no_label_no_text_annotation(self):
        result = shapes_to_occlusion_field(self._single_shape(label=""), 400, 200)
        self.assertNotIn("c0::", result)

    def test_rect_type_in_field(self):
        result = shapes_to_occlusion_field(self._single_shape(), 400, 200)
        self.assertIn("image-occlusion:rect:", result)


if __name__ == "__main__":
    unittest.main()
