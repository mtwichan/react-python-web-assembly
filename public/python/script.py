import pandas as pd

# def process_dataframe(input_data):
#     try:
#         # Convert input data to DataFrame
#         df = pd.DataFrame(input_data)
        
#         # Perform computations
#         result = df.sum().to_dict()  # Changed to dict for better JS compatibility
#         return {'status': 'success', 'data': result}
#     except Exception as e:
#         return {'status': 'error', 'message': str(e)}

# Access variables passed from React

data = globals().get("data")
print("Received data type:", type(data))

# Convert JsProxy to Python dictionary
if hasattr(data, 'to_py'):
    data = data.to_py()
print("Converted data:", data)

if isinstance(data, dict):
    df = pd.DataFrame.from_dict(data)
elif isinstance(data, str):
    import json
    data = json.loads(data)
    df = pd.DataFrame.from_dict(data)
    
else:
    raise TypeError(f"Unexpected data type: {type(data)}")

result = df.sum().to_json()
result