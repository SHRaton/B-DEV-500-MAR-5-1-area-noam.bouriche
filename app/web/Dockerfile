# Step 1: Build the Flutter application
FROM ubuntu:20.04 AS build

ENV DEBIAN_FRONTEND=noninteractive

#dépendances fdp
RUN apt-get update && apt-get install -y \
    curl \
    git \
    unzip \
    xz-utils \
    zip \
    libglu1-mesa \
    && rm -rf /var/lib/apt/lists/*

# version de Flutter
ENV FLUTTER_VERSION=3.10.0
RUN git clone https://github.com/flutter/flutter.git -b ${FLUTTER_VERSION} /flutter
ENV PATH="/flutter/bin:${PATH}"

WORKDIR /app

COPY pubspec.* ./

RUN flutter doctor -v

# Obtenir les dépendances de salope
RUN flutter pub get

COPY . .

RUN flutter build web --release

FROM nginx:alpine

COPY --from=build /app/build/web /usr/share/nginx/html

EXPOSE 80

# Démarrer Nginx nigga
CMD ["nginx", "-g", "daemon off;"]