# backend.Dockerfile
WORKDIR /app

# Copy requirements.txt
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy all backend files
COPY . .

# Expose port (optional)
EXPOSE 5000

# Command to run
CMD ["python", "app.py"]
