import sys
import json
import numpy as np
import cv2
from deepface import DeepFace
import os
import requests
from PIL import Image
from io import BytesIO
from scipy import stats

os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

def load_image(image_path_or_url):
    if image_path_or_url.startswith(("http://", "https://")):
        response = requests.get(image_path_or_url)
        response.raise_for_status()
        return Image.open(BytesIO(response.content))
    return Image.open(image_path_or_url)

def analyze_face_consistency(image):
    """Phân tích tính nhất quán của khuôn mặt"""
    try:
        # Phân tích các đặc điểm khuôn mặt
        analysis = DeepFace.analyze(image, actions=['age', 'gender', 'race', 'emotion'], enforce_detection=False)
        
        # Kiểm tra tính nhất quán của các đặc điểm
        face_consistency = {
            "age_consistency": True,  # Mặc định là True
            "gender_consistency": True,
            "emotion_consistency": True
        }
        
        # Phân tích độ tuổi
        age = analysis[0]['age']
        if age < 0 or age > 120:  # Độ tuổi không hợp lý
            face_consistency["age_consistency"] = False
            
        # Phân tích giới tính
        gender = analysis[0]['gender']
        if gender not in ['Man', 'Woman']:  # Giới tính không hợp lệ
            face_consistency["gender_consistency"] = False
            
        # Phân tích cảm xúc
        emotions = analysis[0]['emotion']
        max_emotion = max(emotions.values())
        if max_emotion < 0.3:  # Cảm xúc không rõ ràng
            face_consistency["emotion_consistency"] = False
            
        return face_consistency
    except Exception as e:
        return {"error": str(e)}

def analyze_face_artifacts(image):
    """Phân tích các dấu hiệu giả mạo trong ảnh"""
    try:
        # Chuyển ảnh sang định dạng numpy array
        img_array = np.array(image)
        
        # Chuyển sang ảnh xám để phân tích
        gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
        
        # Phân tích histogram
        hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
        hist = cv2.normalize(hist, hist).flatten()
        
        # Tính toán các thống kê
        mean = np.mean(hist)
        std = np.std(hist)
        skewness = stats.skew(hist)
        
        # Phát hiện các dấu hiệu bất thường
        artifacts = {
            "histogram_anomaly": False,
            "edge_anomaly": False,
            "texture_anomaly": False
        }
        
        # Kiểm tra histogram bất thường
        if std > 0.5 or abs(skewness) > 2:
            artifacts["histogram_anomaly"] = True
            
        # Phân tích cạnh
        edges = cv2.Canny(gray, 100, 200)
        edge_density = np.sum(edges > 0) / edges.size
        
        if edge_density > 0.3:  # Quá nhiều cạnh
            artifacts["edge_anomaly"] = True
            
        # Phân tích kết cấu
        laplacian = cv2.Laplacian(gray, cv2.CV_64F).var()
        if laplacian < 100:  # Kết cấu mờ
            artifacts["texture_anomaly"] = True
            
        return artifacts
    except Exception as e:
        return {"error": str(e)}

def detect_deepfake(image_path):
    """Hàm chính để phát hiện deepfake"""
    try:
        # Tải ảnh
        image = load_image(image_path)
        
        # Phân tích tính nhất quán của khuôn mặt
        face_consistency = analyze_face_consistency(image)
        
        # Phân tích các dấu hiệu giả mạo
        artifacts = analyze_face_artifacts(image)
        
        # Tính điểm deepfake
        deepfake_score = 0
        total_checks = 6  # Tổng số kiểm tra
        
        # Đánh giá các dấu hiệu
        if not face_consistency.get("age_consistency", True):
            deepfake_score += 1
        if not face_consistency.get("gender_consistency", True):
            deepfake_score += 1
        if not face_consistency.get("emotion_consistency", True):
            deepfake_score += 1
        if artifacts.get("histogram_anomaly", False):
            deepfake_score += 1
        if artifacts.get("edge_anomaly", False):
            deepfake_score += 1
        if artifacts.get("texture_anomaly", False):
            deepfake_score += 1
            
        # Tính tỷ lệ deepfake
        deepfake_probability = deepfake_score / total_checks
        
        return {
            "is_deepfake": deepfake_probability > 0.5,
            "deepfake_probability": deepfake_probability,
            "face_consistency": face_consistency,
            "artifacts": artifacts,
            "details": {
                "total_checks": total_checks,
                "failed_checks": deepfake_score
            }
        }
    except Exception as e:
        return {"error": str(e)}

# Lấy đường dẫn ảnh từ tham số dòng lệnh
if len(sys.argv) > 1:
    image_path = sys.argv[1]
    result = detect_deepfake(image_path)
    print(json.dumps(result)) 