# Étape 1: Construire l'application Flutter
FROM cirrusci/flutter:latest AS build

# Créer un utilisateur non-root
RUN useradd -ms /bin/sh flutteruser
USER flutteruser

WORKDIR /app

RUN git config --global --add safe.directory /sdks/flutter

# Copier le fichier pubspec et télécharger les dépendances
COPY pubspec.* ./
RUN flutter pub get

# Copier le reste des fichiers et construire l'application
COPY . .
RUN flutter build web

# Étape 2: Servir l'application construite
FROM nginx:alpine

COPY --from=build /app/build/web /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
