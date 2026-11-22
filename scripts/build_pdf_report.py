import os
import base64
import subprocess
import sys

def get_base64_image(path):
    if os.path.exists(path):
        with open(path, 'rb') as f:
            data = base64.b64encode(f.read()).decode('utf-8')
            ext = os.path.splitext(path)[1].lower().replace('.', '')
            if ext == 'jpg': ext = 'jpeg'
            return f"data:image/{ext};base64,{data}"
    return ""

def main():
    script_dir = os.path.abspath(os.path.dirname(__file__))
    root_dir = os.path.abspath(os.path.join(script_dir, '..'))
    img_dashboard_path = os.path.join(root_dir, 'frontend', 'public', 'samples', 'dashboard.jpeg')
    img_smart_city_path = os.path.join(root_dir, 'frontend', 'public', 'samples', 'neuraleye-smart-city-vision.png')

    dashboard_b64 = get_base64_image(img_dashboard_path)
    smart_city_b64 = get_base64_image(img_smart_city_path)

    html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>NeuralEye 3D Vision - Engineering & Product Master Report</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap');

    @page {{
      size: A4;
      margin: 12mm 14mm 14mm 14mm;
    }}

    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }}

    body {{
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #0f172a;
      background: #ffffff;
      line-height: 1.55;
      font-size: 11pt;
    }}

    .page-break {{
      page-break-before: always;
      break-before: page;
      padding-top: 10px;
    }}

    /* Cover / Header Banner */
    .report-header {{
      background: linear-gradient(135deg, #091124 0%, #0d1b3e 50%, #0284c7 100%);
      color: #ffffff;
      padding: 32px 30px;
      border-radius: 16px;
      margin-bottom: 24px;
      box-shadow: 0 10px 25px rgba(2, 132, 199, 0.2);
    }}

    .header-badge {{
      display: inline-block;
      background: rgba(0, 242, 254, 0.18);
      border: 1px solid rgba(0, 242, 254, 0.4);
      color: #00f2fe;
      font-family: 'JetBrains Mono', monospace;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      padding: 4px 12px;
      border-radius: 999px;
      margin-bottom: 12px;
    }}

    .report-title {{
      font-size: 26pt;
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }}

    .report-title span {{
      color: #38bdf8;
    }}

    .report-subtitle {{
      font-size: 11.5pt;
      color: #cbd5e1;
      max-width: 90%;
      margin-bottom: 18px;
      line-height: 1.45;
    }}

    .header-meta-row {{
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      padding-top: 14px;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
      font-size: 8.5pt;
      color: #94a3b8;
    }}

    .header-meta-item strong {{
      color: #f8fafc;
    }}

    /* Section Styles */
    .section-title {{
      font-size: 15pt;
      font-weight: 800;
      color: #0b1938;
      border-bottom: 2px solid #0284c7;
      padding-bottom: 6px;
      margin-top: 20px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }}

    .section-title .sec-num {{
      background: #0284c7;
      color: #ffffff;
      font-size: 9pt;
      font-family: 'JetBrains Mono', monospace;
      padding: 2px 7px;
      border-radius: 6px;
      font-weight: 700;
    }}

    p {{
      margin-bottom: 10px;
      color: #334155;
      font-size: 10pt;
      text-align: justify;
    }}

    /* Highlights / Cards Grid */
    .grid-2 {{
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin: 14px 0;
    }}

    .grid-3 {{
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
      margin: 14px 0;
    }}

    .card {{
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 12px 14px;
    }}

    .card-accent-blue {{
      border-left: 4px solid #0284c7;
      background: #f0f9ff;
    }}

    .card-accent-cyan {{
      border-left: 4px solid #06b6d4;
      background: #ecfeff;
    }}

    .card-accent-emerald {{
      border-left: 4px solid #10b981;
      background: #ecfdf5;
    }}

    .card-accent-purple {{
      border-left: 4px solid #8b5cf6;
      background: #f5f3ff;
    }}

    .card h4 {{
      font-size: 10pt;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;
    }}

    .card p {{
      font-size: 8.8pt;
      color: #475569;
      margin: 0;
      line-height: 1.45;
    }}

    /* Figure & Image */
    .figure-container {{
      margin: 14px 0 16px;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      overflow: hidden;
      background: #0b1120;
      text-align: center;
      page-break-inside: avoid;
    }}

    .figure-container img {{
      width: 100%;
      max-height: 250px;
      object-fit: cover;
      display: block;
    }}

    .figure-caption {{
      padding: 7px 12px;
      font-size: 8pt;
      color: #94a3b8;
      background: #070d1d;
      text-align: left;
      font-family: 'JetBrains Mono', monospace;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }}

    .figure-caption strong {{
      color: #38bdf8;
    }}

    /* Spec Table */
    table {{
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;
      font-size: 8.8pt;
    }}

    th, td {{
      padding: 7px 10px;
      border: 1px solid #cbd5e1;
      text-align: left;
    }}

    th {{
      background: #0f172a;
      color: #ffffff;
      font-weight: 700;
      font-size: 8.5pt;
      letter-spacing: 0.3px;
    }}

    tr:nth-child(even) {{
      background: #f8fafc;
    }}

    .badge {{
      display: inline-block;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 7.5pt;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
    }}

    .badge-cyan {{ background: #cffafe; color: #0891b2; }}
    .badge-emerald {{ background: #d1fae5; color: #059669; }}
    .badge-purple {{ background: #ede9fe; color: #7c3aed; }}
    .badge-amber {{ background: #fef3c7; color: #d97706; }}

    /* Creator Profile Card */
    .profile-banner {{
      background: linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%);
      border: 1px solid #bae6fd;
      border-radius: 14px;
      padding: 16px 20px;
      margin: 16px 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }}

    .profile-info h3 {{
      font-size: 13pt;
      font-weight: 800;
      color: #0c4a6e;
      margin-bottom: 2px;
    }}

    .profile-info .role-tag {{
      font-family: 'JetBrains Mono', monospace;
      font-size: 8pt;
      font-weight: 700;
      color: #0284c7;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 6px;
      display: block;
    }}

    .profile-info p {{
      font-size: 8.8pt;
      color: #334155;
      margin: 0;
    }}

    .profile-contact {{
      text-align: right;
      font-size: 8.5pt;
      color: #0284c7;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 600;
    }}

    /* Step Guide */
    .step-item {{
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 10px;
    }}

    .step-circle {{
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #0284c7;
      color: #ffffff;
      font-size: 8.5pt;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 2px;
    }}

    .step-content h5 {{
      font-size: 9.5pt;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 2px;
    }}

    .step-content p {{
      font-size: 8.8pt;
      color: #475569;
      margin: 0;
    }}

    /* Footer on pages */
    .footer-note {{
      margin-top: 24px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      font-size: 7.8pt;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: 'JetBrains Mono', monospace;
    }}
  </style>
</head>
<body>

  <!-- ==================== PAGE 1 ==================== -->
  <div class="report-header">
    <div class="header-badge">ENGINEERING SPECIFICATION & MASTER WHITE-PAPER</div>
    <h1 class="report-title">NeuralEye <span>3D Vision</span></h1>
    <div class="report-subtitle">
      Enterprise Edge Computer Vision & Real-Time Spatial Intelligence Platform Built on Client-Side WebAssembly, YOLOv11 Tensor Acceleration, and Zero-Cloud Latency.
    </div>
    <div class="header-meta-row">
      <div class="header-meta-item">Lead Architect: <strong>Chandrakant</strong></div>
      <div class="header-meta-item">Architecture: <strong>Hybrid Edge-Client + FastAPI</strong></div>
      <div class="header-meta-item">Model Core: <strong>YOLOv11 Tensor Engine (ONNX)</strong></div>
      <div class="header-meta-item">Security: <strong>100% Air-Gapped Zero-Cloud</strong></div>
    </div>
  </div>

  <div class="section-title">
    <span class="sec-num">01</span>
    Executive Summary: Ye Web App Kya Kaam Karta Hai?
  </div>
  <p>
    <strong>NeuralEye 3D Vision</strong> ek cutting-edge, industrial-grade <strong>Computer Vision aur Deep Learning Web Platform</strong> hai. Yeh application high-resolution video streams, live optical cameras, aur static drone/panoramic images ko real-time me analyze karke multi-class objects (Cars, Bikes, Persons, Buses, Traffic Lights, Animals, Gadgets) ko detect karti hai aur unke upar precise <strong>3D Depth Bounding Projections</strong> draw karti hai.
  </p>
  <p>
    Traditional AI applications me aapka video stream kisi third-party cloud server par bheja jata hai jahan latency aati hai aur data leak hone ka khatra hota hai. <strong>NeuralEye</strong> is paradigm ko transform karta hai: yeh model ko sidha user ke <strong>browser me WebAssembly (WASM SIMD) aur WebWorkers</strong> ke through execute karta hai, jisse <strong>0.0ms Cloud Latency</strong> aur <strong>100% On-Device Privacy</strong> milti hai.
  </p>

  <div class="grid-2">
    <div class="card card-accent-blue">
      <h4>⚡ Real-Time In-Browser Edge Inference</h4>
      <p>YOLOv11 deep neural network sidha client ke CPU/GPU par execute hota hai bina frame cloud par bheje.</p>
    </div>
    <div class="card card-accent-cyan">
      <h4>🎯 SAHI Micro-Window Slicing</h4>
      <p>Ultra-high-definition 4K images ko micro-crops me slice karke minute aur distant objects accurately detect karta hai.</p>
    </div>
    <div class="card card-accent-emerald">
      <h4>🛡️ 100% Air-Gapped Privacy</h4>
      <p>GDPR aur military standards ke mutabiq zero video egress — sensitive surveillance video device memory me hi rehta hai.</p>
    </div>
    <div class="card card-accent-purple">
      <h4>📊 Live Telemetry & Class Breakdown</h4>
      <p>Real-time analytics engine jo scene objects, distribution donut chart, aur instant class inventory count provide karta hai.</p>
    </div>
  </div>

  <!-- Primary Illustrated Visual -->
  <div class="figure-container">
    <img src="{dashboard_b64}" alt="NeuralEye Smart City Intersection Detection Visual">
    <div class="figure-caption">
      <strong>FIGURE 1.0:</strong> NeuralEye Real-Time Multi-Object Detection HUD in Urban Smart City Environment (Pune Station Intersection Benchmark). 10 Objects Classified Across 7 Distinct Categories with 3D Depth Projections.
    </div>
  </div>

  <div class="footer-note">
    <span>NEURALEYE 3D VISION SYSTEMS // MASTER SPECIFICATION</span>
    <span>CONFIDENTIAL & PROPRIETARY // PAGE 1</span>
  </div>

  <!-- ==================== PAGE 2 ==================== -->
  <div class="page-break"></div>

  <div class="section-title">
    <span class="sec-num">02</span>
    Kyun Banaya Gaya? (Problem Statement & Purpose)
  </div>
  <p>
    Pehle ke surveillance aur smart vision systems me 4 badi samasyaayein (bottlenecks) thi, jinko solve karne ke liye NeuralEye ko design kiya gaya:
  </p>

  <table>
    <thead>
      <tr>
        <th style="width: 28%;">Traditional Cloud AI Problem</th>
        <th style="width: 38%;">Industry Impact</th>
        <th style="width: 34%;">NeuralEye Edge Solution</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>High Cloud Latency</strong></td>
        <td>CCTV feed ko cloud server bhejna aur wapas response aana 300ms-800ms leta hai, jo autonomous navigation aur live security ke liye slow hai.</td>
        <td><span class="badge badge-cyan">0.0ms Network Latency</span> — WASM SIMD ke saath browser/device memory me local inference.</td>
      </tr>
      <tr>
        <td><strong>Severe Privacy Risks</strong></td>
        <td>Sensitive public cameras ya private offices ki video feed external servers par transfer hone se data breach aur surveillance leaks hote hain.</td>
        <td><span class="badge badge-emerald">Air-Gapped Sandbox</span> — Video frames device se bahar travel hi nahi karte. 100% on-premise.</td>
      </tr>
      <tr>
        <td><strong>Exorbitant GPU Cloud Costs</strong></td>
        <td>24/7 chalne wale hazaron cameras ke liye AWS/GCP par A100 GPU servers rent karna monthly lakho rupaye ka kharcha hota hai.</td>
        <td><span class="badge badge-purple">Zero Infrastructure Cost</span> — Client device hardware compute use karta hai. Unlimited scalability.</td>
      </tr>
      <tr>
        <td><strong>Small & Occluded Objects Loss</strong></td>
        <td>Standard 640x640 resize me 4K drones ya wide-angle traffic feeds me door khade log aur chhote vehicles gayab ho jaate hain.</td>
        <td><span class="badge badge-amber">SAHI Slicing Engine</span> — Multi-scale patch processing jo 10x door ke objects detect karta hai.</td>
      </tr>
    </tbody>
  </table>

  <div class="section-title">
    <span class="sec-num">03</span>
    Kahan Use Karein? (Real-World Use Cases)
  </div>

  <div class="grid-3">
    <div class="card">
      <h4 style="color: #0284c7;">🚦 Smart Cities & Traffic</h4>
      <p>Intersection congestion monitoring, vehicle counting (Cars, Buses, Bikes), pedestrian crossing safety, red-light telemetry tracking.</p>
    </div>
    <div class="card">
      <h4 style="color: #059669;">🏭 Industrial & Factories</h4>
      <p>Assembly line defects spotting, worker safety PPE helmet detection, automated packaging count, hazardous area intrusion alerts.</p>
    </div>
    <div class="card">
      <h4 style="color: #7c3aed;">🚁 Drone & Aerial Surveillance</h4>
      <p>High-altitude UAV reconnaissance, disaster relief victim spotting, border security patrolling, crop health monitoring.</p>
    </div>
  </div>

  <div class="figure-container">
    <img src="{smart_city_b64}" alt="NeuralEye 3D Panoramic Smart City Platform">
    <div class="figure-caption">
      <strong>FIGURE 2.0:</strong> NeuralEye Panoramic Urban Vision Deployment Architecture — Automated Sliced Detection on 4K Municipal Infrastructure Video Feeds.
    </div>
  </div>

  <div class="footer-note">
    <span>NEURALEYE 3D VISION SYSTEMS // MASTER SPECIFICATION</span>
    <span>CONFIDENTIAL & PROPRIETARY // PAGE 2</span>
  </div>

  <!-- ==================== PAGE 3 ==================== -->
  <div class="page-break"></div>

  <div class="section-title">
    <span class="sec-num">04</span>
    Kaise Use Karein? (Step-by-Step Operator Guide)
  </div>

  <div class="step-item">
    <div class="step-circle">1</div>
    <div class="step-content">
      <h5>Interactive Dashboard Launch (/dashboard)</h5>
      <p>Web browser me project open karein. Top navigation bar se <strong>Dashboard</strong> select karein. Platform automatic client WASM SIMD environment load karta hai.</p>
    </div>
  </div>

  <div class="step-item">
    <div class="step-circle">2</div>
    <div class="step-content">
      <h5>Input Mode Selection (Image vs. Live Webcam)</h5>
      <p><strong>Choose Image</strong> par click karke apni custom 4K image upload karein ya built-in benchmark samples (Live Intersection, Traffic Scene, Car, Objects) par click karein.</p>
    </div>
  </div>

  <div class="step-item">
    <div class="step-circle">3</div>
    <div class="step-content">
      <h5>Target Architecture & Confidence Tuning</h5>
      <p>Detection sensitivity ke liye <strong>Conf Slider (0.10 - 0.95)</strong> set karein. Model architecture dropdown se <em>Smart Desk & Gadgets</em>, <em>COCO 80</em>, ya <em>YOLO-World Zero-Shot</em> chun sakte hain.</p>
    </div>
  </div>

  <div class="step-item">
    <div class="step-circle">4</div>
    <div class="step-content">
      <h5>Live Camera Feed & HUD Telemetry (/live)</h5>
      <p>Full viewport live camera tracking ke liye <strong>Live View</strong> tab par jayein aur <strong>Start Camera Feed</strong> click karein. Local webcam frames real-time 3D bounding boxes ke saath annotate hote hain.</p>
    </div>
  </div>

  <div class="step-item">
    <div class="step-circle">5</div>
    <div class="step-content">
      <h5>Real-Time Telemetry & Inventory Breakdown</h5>
      <p>Left panel par <strong>Telemetry Inferred / min</strong>, <strong>Object Distribution Donut</strong>, aur <strong>Class Breakdown (Cars: 2, Bus: 1...)</strong> automatically compute hota hai.</p>
    </div>
  </div>

  <div class="section-title">
    <span class="sec-num">05</span>
    Technical Architecture: Kaise Bani Hai?
  </div>

  <table>
    <thead>
      <tr>
        <th>Layer</th>
        <th>Technologies</th>
        <th>Architectural Responsibility</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Client Frontend</strong></td>
        <td>React 19, Vite 8, Tailwind CSS 4, Motion</td>
        <td>Ultra-fast reactive UI, Cyberpunk HUD reticles, interactive analytics canvas, high-DPI scaling.</td>
      </tr>
      <tr>
        <td><strong>Edge Inference</strong></td>
        <td>ONNX Runtime Web, WASM SIMD, WebWorkers</td>
        <td>Non-blocking multi-threaded inference on client browser; zero frame uploads to remote cloud.</td>
      </tr>
      <tr>
        <td><strong>Backend Microservice</strong></td>
        <td>Python FastAPI, PyTorch, Ultralytics YOLOv11</td>
        <td>High-accuracy batch processing, heavy tensor operations, REST and WebSocket endpoints.</td>
      </tr>
      <tr>
        <td><strong>Slicing Engine</strong></td>
        <td>SAHI (Slicing Aided Hyper Inference), OpenCV</td>
        <td>Gigapixel image slicing, overlapping window inference, and Non-Maximum Suppression (NMS) merging.</td>
      </tr>
    </tbody>
  </table>

  <!-- Creator Section -->
  <div class="section-title">
    <span class="sec-num">06</span>
    Kisne Banaya Hai? (Lead Architect & Credits)
  </div>

  <div class="profile-banner">
    <div class="profile-info">
      <h3>Chandrakant</h3>
      <span class="role-tag">Lead AI Engineer & System Architect</span>
      <p>
        High-throughput edge computer vision, real-time deep learning inference optimization, and distributed AI application architectures ke specialist. NeuralEye ke complete end-to-end frontend, model worker integration, SAHI pipeline, aur UI/UX design architecture ke creator.
      </p>
    </div>
    <div class="profile-contact">
      <div>DIRECT INQUIRY CHANNEL</div>
      <div style="color: #0369a1; font-size: 9pt; margin-top: 4px;">chandrakant150805@gmail.com</div>
      <div style="color: #10b981; font-size: 7.5pt; margin-top: 4px;">Verified System Creator</div>
    </div>
  </div>

  <div class="section-title">
    <span class="sec-num">07</span>
    Future Plans & Development Roadmap
  </div>

  <div class="grid-2">
    <div class="card card-accent-blue">
      <h4>Phase 01 // DeepSORT Tracking (In Progress)</h4>
      <p><strong>Status: 85% Complete.</strong> Kalman filtering aur deep appearance feature extractors ke through video frames me persistent object IDs aur velocity trajectory vectors implement karna.</p>
    </div>
    <div class="card card-accent-cyan">
      <h4>Phase 02 // Cloud Inference Microservice API</h4>
      <p><strong>Target: Q2 2026.</strong> High-throughput authenticated REST, gRPC aur WebSocket streaming endpoints enterprise camera surveillance networks ke integration ke liye.</p>
    </div>
    <div class="card card-accent-emerald">
      <h4>Phase 03 // Mobile PWA & WebGPU Acceleration</h4>
      <p><strong>Target: Q3 2026.</strong> Progressive Web App with offline caching aur direct WebGPU compute shaders jo mobile field devices par 120 FPS inference deliver karein.</p>
    </div>
    <div class="card card-accent-purple">
      <h4>Phase 04 // In-Browser Fine-Tuning Studio</h4>
      <p><strong>Target: Q4 2026.</strong> Browser ke andar hi bounding-box dataset annotation, hard-example mining, aur custom weight transfer learning studio add karna.</p>
    </div>
  </div>

  <div class="footer-note">
    <span>NEURALEYE 3D VISION SYSTEMS // MASTER SPECIFICATION</span>
    <span>CONFIDENTIAL & PROPRIETARY // PAGE 3</span>
  </div>

</body>
</html>
"""

    docs_dir = os.path.join(root_dir, 'docs')
    os.makedirs(docs_dir, exist_ok=True)
    html_file = os.path.join(docs_dir, 'Report.html')
    pdf_file = os.path.join(docs_dir, 'Report.pdf')

    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print(f"HTML written to {html_file}")

    # Look for Chrome or Edge executable
    chrome_paths = [
        r'C:\Program Files\Google\Chrome\Application\chrome.exe',
        r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
        r'C:\Program Files\Microsoft\Edge\Application\msedge.exe'
    ]

    browser_bin = None
    for bp in chrome_paths:
        if os.path.exists(bp):
            browser_bin = bp
            break

    if not browser_bin:
        print("Error: Chrome or Edge not found.")
        sys.exit(1)

    print(f"Using browser: {browser_bin}")
    cmd = [
        browser_bin,
        '--headless',
        '--disable-gpu',
        '--no-pdf-header-footer',
        f'--print-to-pdf={pdf_file}',
        f'file:///{html_file.replace(os.sep, "/")}'
    ]

    try:
        # Use Start-Process via powershell or direct subprocess
        ps_cmd = f'Start-Process -FilePath "{browser_bin}" -ArgumentList "--headless", "--disable-gpu", "--no-pdf-header-footer", "--print-to-pdf={pdf_file}", "file:///{html_file.replace(os.sep, "/")}" -Wait'
        subprocess.run(['powershell', '-Command', ps_cmd], capture_output=True, text=True)
    except Exception as e:
        subprocess.run(cmd, capture_output=True, text=True)

    if os.path.exists(pdf_file) and os.path.getsize(pdf_file) > 1000:
        print(f"SUCCESS: Report.pdf created successfully! Size: {os.path.getsize(pdf_file)} bytes")
    else:
        print("Failed to generate PDF.")
        sys.exit(1)

if __name__ == '__main__':
    main()
