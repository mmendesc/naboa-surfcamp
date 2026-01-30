# MVP: Surfer Video Triage — Local Prototype

This folder contains the plan and checklist to build a minimal prototype that validates the idea of grouping surf videos by surfer using local AI processing.

Goals
- Build a local prototype (Python) that: ingests a folder of videos, extracts frames, runs person detection, tracks people within each video, computes track embeddings, clusters tracks across videos into candidate "surfers", and produces a simple review UI (Streamlit) to inspect and export grouped folders.
- Must run locally (no cloud), support macOS (Apple Silicon preferred for speed), and be easy to iterate on.

Artifacts (MVP)
- `prototype/` script(s): frame extraction, detection+tracking, embedding+clustering
- `ui/streamlit_app.py`: minimal UI to review clusters and export groups
- `data/`: sample videos (user-supplied) and cached thumbnails/embeddings
- `requirements.txt` with pinned dependency set

Local dev notes
- Use PyTorch (MPS on Apple Silicon) or CPU-only for Intel Macs
- Use Ultralytics YOLOv8 for detection; DeepSort/StrongSORT for tracking
- Use OSNet (person re-id) for embeddings; optional ArcFace for faces

See the TODO list in `session_todos.json` for step-by-step tasks and estimates.
