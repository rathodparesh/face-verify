"""Generate a tiny pipeline-test ONNX model.

This model is intentionally NOT a face-recognition model. It reduces the input
image to average RGB values and applies a deterministic linear projection. Its
only purpose is to exercise browser loading, preprocessing, inference, result
serialization, and comparison UI without distributing biometric model weights.
"""

from pathlib import Path

import numpy as np
import onnx
from onnx import TensorProto, helper, numpy_helper


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "examples" / "react-demo" / "public" / "models" / "face_embedding.onnx"

rng = np.random.default_rng(20260724)
weights = rng.normal(0.0, 0.25, size=(3, 128)).astype(np.float32)
bias = rng.normal(0.0, 0.01, size=(128,)).astype(np.float32)

input_info = helper.make_tensor_value_info(
    "input",
    TensorProto.FLOAT,
    [1, 3, 112, 112],
)
output_info = helper.make_tensor_value_info(
    "embedding",
    TensorProto.FLOAT,
    [1, 128],
)

nodes = [
    helper.make_node("GlobalAveragePool", ["input"], ["pooled"]),
    helper.make_node("Flatten", ["pooled"], ["features"], axis=1),
    helper.make_node("Gemm", ["features", "weights", "bias"], ["embedding"]),
]

graph = helper.make_graph(
    nodes,
    "FaceVerifyDemoEmbeddingPipelineTest",
    [input_info],
    [output_info],
    [numpy_helper.from_array(weights, "weights"), numpy_helper.from_array(bias, "bias")],
)
model = helper.make_model(
    graph,
    producer_name="FaceVerify demo model generator",
    opset_imports=[helper.make_opsetid("", 17)],
)
model.ir_version = 9
model.doc_string = (
    "DEMO ONLY. This is not a face-recognition or biometric verification model. "
    "It uses average RGB values and a deterministic random projection."
)
model.metadata_props.add(
    key="faceverify_usage",
    value="pipeline testing only; never use for identity, security, or biometric decisions",
)

onnx.checker.check_model(model)
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
onnx.save(model, OUTPUT)
print(f"Created {OUTPUT} ({OUTPUT.stat().st_size} bytes)")
