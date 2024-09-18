FROM python:3.9-slim

WORKDIR /app

# Copie le fichier requirements.txt dans le conteneur
COPY requirements.txt .

# Installe les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Copie le reste du code source dans le conteneur
COPY . .

CMD ["python", "app.py"]
