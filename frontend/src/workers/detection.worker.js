import * as ort from 'onnxruntime-web';

let session = null;

const DEFAULT_LABELS = [
  "person", "bicycle", "car", "motorcycle", "airplane", "bus", "train", "truck", "boat",
  "traffic light", "fire hydrant", "stop sign", "parking meter", "bench", "bird", "cat",
  "dog", "horse", "sheep", "cow", "elephant", "bear", "zebra", "giraffe", "backpack",
  "umbrella", "handbag", "tie", "suitcase", "frisbee", "skis", "snowboard", "sports ball",
  "kite", "baseball bat", "baseball glove", "skateboard", "surfboard", "tennis racket",
  "bottle", "wine glass", "cup", "fork", "knife", "spoon", "bowl", "banana", "apple",
  "sandwich", "orange", "broccoli", "carrot", "hot dog", "pizza", "donut", "cake", "chair",
  "couch", "potted plant", "bed", "dining table", "toilet", "tv", "laptop", "mouse", "remote",
  "keyboard", "cell phone", "microwave", "oven", "toaster", "sink", "refrigerator", "book",
  "clock", "vase", "scissors", "teddy bear", "hair drier", "toothbrush"
];

let labels = [...DEFAULT_LABELS];

// Known low-precision hallucination triggers in desk and indoor webcam settings
const SPURIOUS_WEBCAM_CLASSES = new Set([
  "teddy bear", "toaster", "parking meter", "frisbee", "skis", "snowboard",
  "kite", "baseball glove", "surfboard", "hair drier", "zebra", "giraffe", "bear", "cow"
]);

async function loadModel(modelPath = '/models/yolov8n.onnx') {
  try {
    session = await ort.InferenceSession.create(modelPath, {
      executionProviders: ['webgpu', 'webgl', 'wasm'],
      graphOptimizationLevel: 'all'
    });
    self.postMessage({ type: 'LOADED', modelPath });
  } catch (e) {
    self.postMessage({ type: 'ERROR', error: e.message });
  }
}

function iou(box1, box2) {
  const [x1, y1, w1, h1] = box1;
  const [x2, y2, w2, h2] = box2;
  const x_overlap = Math.max(0, Math.min(x1 + w1, x2 + w2) - Math.max(x1, x2));
  const y_overlap = Math.max(0, Math.min(y1 + h1, y2 + h2) - Math.max(y1, y2));
  const intersection = x_overlap * y_overlap;
  const union = w1 * h1 + w2 * h2 - intersection;
  return intersection / union;
}

function nonMaxSuppression(boxes, scores, iouThreshold) {
  const indices = scores
    .map((score, i) => ({ score, i }))
    .sort((a, b) => b.score - a.score)
    .map(v => v.i);

  const kept = [];
  while (indices.length > 0) {
    const current = indices.shift();
    kept.push(current);
    for (let i = 0; i < indices.length; i++) {
      if (iou(boxes[current], boxes[indices[i]]) > iouThreshold) {
        indices.splice(i, 1);
        i--;
      }
    }
  }
  return kept;
}

async function detect(buffer, threshold, iouThreshold, options = {}) {
  if (!session) return;

  const { filterSpurious = true, allowedClasses = null } = options;

  // Convert Uint8Array buffer back to Float32Array [1, 3, 640, 640]
  const data = new Uint8ClampedArray(buffer);
  const float32Data = new Float32Array(3 * 640 * 640);
  for (let i = 0; i < data.length / 4; i++) {
    float32Data[i] = data[i * 4] / 255.0; // R
    float32Data[i + 640 * 640] = data[i * 4 + 1] / 255.0; // G
    float32Data[i + 2 * 640 * 640] = data[i * 4 + 2] / 255.0; // B
  }

  const imageTensor = new ort.Tensor('float32', float32Data, [1, 3, 640, 640]);
  const feeds = { images: imageTensor };
  const results = await session.run(feeds);
  const output = results.output0.data; // [1, num_channels, 8400]

  const numClasses = labels.length;
  const totalChannels = 4 + numClasses;

  const boxes = [];
  const scores = [];
  const classIds = [];

  for (let i = 0; i < 8400; i++) {
    let maxScore = 0;
    let classId = -1;

    for (let j = 4; j < totalChannels; j++) {
      const cid = j - 4;
      const label = labels[cid] || `class_${cid}`;

      if (filterSpurious && SPURIOUS_WEBCAM_CLASSES.has(label)) {
        continue;
      }

      if (allowedClasses && allowedClasses.length > 0 && !allowedClasses.includes(label)) {
        continue;
      }

      const score = output[j * 8400 + i];
      if (score > maxScore) {
        maxScore = score;
        classId = cid;
      }
    }

    if (maxScore > threshold && classId !== -1) {
      const x = output[0 * 8400 + i];
      const y = output[1 * 8400 + i];
      const w = output[2 * 8400 + i];
      const h = output[3 * 8400 + i];

      boxes.push([x - w / 2, y - h / 2, w, h]);
      scores.push(maxScore);
      classIds.push(classId);
    }
  }

  const indices = nonMaxSuppression(boxes, scores, iouThreshold);

  const finalDetections = indices.map(idx => ({
    label: labels[classIds[idx]] || `Class ${classIds[idx]}`,
    confidence: scores[idx],
    bbox: boxes[idx]
  }));

  self.postMessage({ type: 'RESULTS', detections: finalDetections });
}

self.onmessage = async (e) => {
  const { type, data } = e.data;
  if (type === 'LOAD') {
    await loadModel(data?.modelPath || '/models/yolov8n.onnx');
  } else if (type === 'SET_LABELS') {
    if (Array.isArray(data?.labels) && data.labels.length > 0) {
      labels = [...data.labels];
    }
  } else if (type === 'DETECT') {
    const { buffer, threshold, iouThreshold, options } = data;
    await detect(buffer, threshold, iouThreshold, options || {});
  }
};
