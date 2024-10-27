# AREA - Epitech Project 2024 🧩

## Purpose of the project
The goal of this project is to discover, as a whole, the software platform that we have chosen through the  
creation of a business application.  
To do this, we have implemented a software suite that functions similar to that of IFTTT and/or Zapier.  
This software suite is broken into three parts :  
•  An  **application server**  to implement all the features listed below (see  Features)  
•  A  **web client**  to use the application from your browser by querying the  application server  
•  A  **mobile client** to use the application from your phone by querying the  application server

The application offer the following functions :  
-  The user registers on the application in order to obtain an account  
-  The registered user then confirms their enrollment on the application before being able to use it
-  The application then asks the authenticated user to subscribe to  Services  
-  Each  service  offers the following components:  
	- type  Action  (see  Action Components)  
	-  type  REAction  (see  REAction Components)  
-  The authenticated user composes  AREA  by interconnecting an  Action  to a  REAction  previously con-  
figured
-  The application triggers  AREA  automatically thanks to triggers 


## Team 👨‍💻

 • Back-end developers : 

- Jérémy Delfino & Théo Berget


 • Front-end developers : 

- Noam Bouriche, Alexandre Vittenet & Rayan Bahri

## Technical Stack ⚙️

### Backend
- Python 🐍
- Flask 🍞
- SQLite Database 🗃️

### Frontend
- React Native 📱💻
- Expo 🚀


## Installation & Running 🛠️


```bash
# Build and start the containers
docker compose up --build
```

This will:
- Start the backend server on port 5000
- Start the frontend application on port 8081