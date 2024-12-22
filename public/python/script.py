import json
from io import StringIO  # Add this import

import pandas as pd
import plotly.express as px
from plotly.utils import PlotlyJSONEncoder

# Get data from global scope (JsProxy)
data = globals().get("data")
if hasattr(data, 'to_py'):
    data = data.to_py()

from js import console, fetch

async def fetch_local_data(file_path):
    try:
        # Convert file path to proper URL format
        response = await fetch(
            f'http://localhost:5173/{file_path}', 
            {'method':'GET'}
        )
        
        if not response.ok:
            console.error('Error loading file:', response.status)
            return None
            
        # Choose the appropriate method based on your file type
        if file_path.endswith('.json'):
            data = await response.json()
        elif file_path.endswith('.csv'):
            data = await response.text()
        else:
            data = await response.text()
            
        console.log('File loaded successfully:', file_path)
        return data
        
    except Exception as e:
        console.error('Error loading file:', str(e))
        return None

async def init():
    # Example: Load a file from public folder
    data = await fetch_local_data('/data/test_2M.csv')
    if data is None:
        console.error('Failed to load file')
    return data


def setup_data(data):
    # global data  # Declare data as global
    # csv_path = "public/data/test_2M.csv"  # Adjust this path to your CSV file location
    # df = pd.read_csv(csv_path)
    # print("Received data type:", type(data))
    # print("Received data:", data)

    if isinstance(data, dict):
        df = pd.DataFrame.from_dict(data)
    elif isinstance(data, str):
        # data = json.loads(data)
        # df = pd.DataFrame.from_dict(data)
        df = pd.read_csv(StringIO(data))
    else:
        raise TypeError(f"Unexpected data type: {type(data)}")
    
    return df


async def main():
    data = await init()    
    df = setup_data(data)
    dff = df.head(100000)

    
    fig = px.scatter(
        dff,
        x='Index',  
        y='Sex',  
        title="User IDs by Index",
    )
    
    # Convert the figure to plotly.js compatible JSON
    graph_json = json.dumps({
        'data': fig.data,
        'layout': fig.layout
    }, cls=PlotlyJSONEncoder)
    
    return graph_json


result = await main() # type: ignore
result