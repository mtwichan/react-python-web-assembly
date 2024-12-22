import pandas as pd

# Create sample data directly
data = {'A': [1, 2, 3], 'B': [4, 5, 6]}
df = pd.DataFrame(data)

# Perform computations
result = df.sum().to_json()
print(result)  # Add print statement to see the output