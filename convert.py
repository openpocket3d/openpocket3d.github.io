import torch
import json
import os

pth_path = 'static/resources/data/scene0011_00_ins.pth'
out_path = 'static/resources/data/scene0011_00_ins_arrays.json'

print("Loading Checkpoint...")
data = torch.load(pth_path, map_location='cpu', weights_only=False)

out_data = None

def make_serializable(obj):
    if hasattr(obj, 'tolist'):
        return obj.tolist()
    elif isinstance(obj, dict):
        return {k: make_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [make_serializable(v) for v in obj]
    elif isinstance(obj, tuple):
        return tuple(make_serializable(v) for v in obj)
    return obj

out_data = make_serializable(data)

print("Saving JSON to:", out_path)
with open(out_path, 'w') as f:
    json.dump(out_data, f)

print(f"\n[DONE] Saved JSON to {out_path}.")
print("-" * 30)
# Output some info so we know the structure in the webpage
if isinstance(out_data, list):
    print("Type: List, Length/Num Masks:", len(out_data))
    if len(out_data) > 0 and isinstance(out_data[0], dict):
        print("First item keys:", out_data[0].keys())
elif isinstance(out_data, dict):
    print("Type: Dict, Keys:", list(out_data.keys())[:10])
else:
    print("Type:", type(out_data))
