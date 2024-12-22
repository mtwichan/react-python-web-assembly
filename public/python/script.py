import json
import pandas as pd
import plotly.express as px
from plotly.utils import PlotlyJSONEncoder

# Get data from global scope (JsProxy)
data = globals().get("data")
if hasattr(data, 'to_py'):
    data = data.to_py()

def setup_data():
    global data  # Declare data as global
    print("Received data type:", type(data))

    if isinstance(data, dict):
        df = pd.DataFrame.from_dict(data)
    elif isinstance(data, str):
        data = json.loads(data)
        df = pd.DataFrame.from_dict(data)
    else:
        raise TypeError(f"Unexpected data type: {type(data)}")
    
    return df


def main():
    df = setup_data()
    fig = px.line(df, x="A", y="B", title="Plotly Line Chart", markers=True)
    
    # Convert the figure to plotly.js compatible JSON
    graph_json = json.dumps({
        'data': fig.data,
        'layout': fig.layout
    }, cls=PlotlyJSONEncoder)
    
    return graph_json

result = main()
result