import argparse
import sys
from ultralytics import YOLO
try:
    from ultralytics import YOLOWorld
except ImportError:
    YOLOWorld = None

from backend.core.logging import logger
from backend.core.config import settings

def train_model(data_yaml="coco128.yaml", epochs=100, imgsz=640, device=None):
    """
    Train a high-capacity YOLOv11 model.
    Using larger models (like 's', 'm', 'l', or 'x') for maximum accuracy.
    """
    logger.info(f"Initializing High-Capacity YOLO model ({settings.MODEL_PATH}) for training")
    model = YOLO(settings.MODEL_PATH)
    
    logger.info(f"Starting high-accuracy training for {epochs} epochs on {data_yaml}")
    results = model.train(
        data=data_yaml,
        epochs=epochs,
        imgsz=imgsz,
        patience=20,
        device=device,
        project="high_accuracy_project",
        name="yolo11_high_cap_run",
        exist_ok=True
    )
    
    logger.info("Training complete.")
    return results

def train_openimages_v7(epochs=50, imgsz=640, model_name="yolo11s.pt", device=None):
    """
    Train on OpenImages v7 covering 600 common real-life object categories.
    Recognizes gadgets, smartphones, tools, clothing, and everyday items.
    """
    logger.info(f"Initiating OpenImages v7 (600 classes) training pipeline with {model_name}")
    model = YOLO(model_name)
    results = model.train(
        data="open-images-v7.yaml",
        epochs=epochs,
        imgsz=imgsz,
        patience=15,
        device=device,
        project="openimages_project",
        name="openimages_600_run",
        exist_ok=True
    )
    logger.info("OpenImages v7 training pipeline complete.")
    return results

def setup_yolo_world(custom_classes=None, model_name="yolov8s-worldv2.pt", export_onnx=True):
    """
    Setup YOLO-World Zero-Shot Open-Vocabulary model.
    Allows real-time detection of arbitrary user-defined text prompts without retraining.
    """
    if custom_classes is None:
        custom_classes = [
            "smartphone", "oneplus phone", "person", "hand", "face", "beanie cap",
            "clothing", "headphones", "laptop", "mouse", "keyboard", "cup", "bottle"
        ]

    logger.info(f"Setting up YOLO-World model ({model_name}) with {len(custom_classes)} custom prompts")
    
    if YOLOWorld is not None:
        model = YOLOWorld(model_name)
    else:
        model = YOLO(model_name)

    # Set custom vocabulary
    model.set_classes(custom_classes)
    logger.info(f"Active classes configured: {custom_classes}")

    if export_onnx:
        output_path = "frontend/public/models/yolo_world_s.onnx"
        logger.info(f"Exporting YOLO-World to ONNX: {output_path}")
        exported_path = model.export(format="onnx", imgsz=640)
        logger.info(f"YOLO-World successfully exported to {exported_path}")
        return exported_path

    return model

def export_model(model_path=settings.MODEL_PATH, format="onnx", imgsz=640):
    """
    Export the model to faster inference formats like ONNX.
    """
    logger.info(f"Exporting model {model_path} to {format}")
    model = YOLO(model_path)
    path = model.export(format=format, imgsz=imgsz)
    logger.info(f"Model exported successfully to {path}")
    return path

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="NeuralEye 3D Vision Model Training and Setup CLI")
    parser.add_argument(
        "--mode",
        choices=["standard", "openimages", "yolo-world", "export"],
        default="export",
        help="Training or configuration pipeline to execute"
    )
    parser.add_argument("--epochs", type=int, default=50, help="Number of training epochs")
    parser.add_argument("--model", type=str, default=settings.MODEL_PATH, help="Base model weights path")
    parser.add_argument("--classes", nargs="+", default=None, help="Custom classes for YOLO-World zero-shot prompt")

    args = parser.parse_args()

    if args.mode == "standard":
        train_model(epochs=args.epochs)
    elif args.mode == "openimages":
        train_openimages_v7(epochs=args.epochs, model_name=args.model)
    elif args.mode == "yolo-world":
        setup_yolo_world(custom_classes=args.classes, model_name=args.model)
    elif args.mode == "export":
        export_model(model_path=args.model)
